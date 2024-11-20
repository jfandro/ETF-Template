using ETFTemplate.Models;
using ETFTemplate.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;

namespace ETFTemplate.Controllers
{
    public class LeadController : ApplicationController
    {
        private readonly int questionnaireid = ApplicationHelper.LeadQuestionnaire;
        private readonly string issuer = ApplicationHelper.ContactEmail;
        private readonly string domain = ApplicationHelper.ServicesUrl;

        /// <summary>
        /// Open robo advisor
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];
            ViewBag.Domain = domain;
            ViewBag.Title = ApplicationHelper.ApplicationName + " - Robot Conseiller";

            return View(new LeadConnection() { QuestionnaireID = questionnaireid });
        }

        /// <summary>
        /// Post lead to confirm
        /// </summary>
        /// <param name="status"></param>
        /// <returns></returns>
        public JsonResult ToConfirm(LeadConnectionStatus status)
        {
            try
            {
                var lead = new LeadConfirmation()
                {
                    Code = status.Code,
                    ID = status.DiligenceID,
                    UserID = status.LeadID
                };

                var model = new LeadToConfirmEmail()
                {
                    To = status.Email,
                    From = issuer,
                    Title = "Confirmation de votre adresse email",
                    Url = Url.AbsoluteAction("Confirm", "Lead", new { id = lead.ID, code = lead.Code, userid = lead.UserID })
                };
                
                // send email
                model.Send();
                return Json(new LeadEmailConfirmationStatus(true, "Email émis avec success"));
            }
            catch (Exception exc)
            {
                return Json(new LeadEmailConfirmationStatus(false, exc.Message));
            }
        }

        /// <summary>
        /// Get confirmation
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Confirm(LeadConfirmation model)
        {
            // json transformation
            var json = JsonConvert.SerializeObject(model);
            var buffer = System.Text.Encoding.UTF8.GetBytes(json);
            var content = new ByteArrayContent(buffer);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            using (var handler = new HttpClientHandler())
            {
                using (var client = new HttpClient(handler) { BaseAddress = GetUri() })
                {
                    using (var response = client.PostAsync("api/Leads/Confirm", content).Result)
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var status = JsonConvert.DeserializeObject<LeadConnectionStatus>(response.Content.ReadAsStringAsync().Result);
                            if (status.Success)
                            {
                                SendConfirmation(status);

                                var tokenDetails = GetToken();
                                ViewBag.token = tokenDetails["access_token"];
                                ViewBag.expires = tokenDetails["expires_in"];

                                return View(status);
                            }
                        }
                        return View("Error");
                    }
                }
            }


        }

        /// <summary>
        /// Get portfolio
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Portfolio(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new LeadDetails() { QuestionnaireID = questionnaireid, Code = id };
            return View(model);
        }

        /// <summary>
        /// Send email confirmation
        /// </summary>
        /// <param name="status"></param>
        private void SendConfirmation(LeadConnectionStatus status)
        {

            var model = new LeadConfirmationEmail()
            {
                To = status.Email,
                From = issuer,
                Title = "Confirmation de votre dossier",
                Questions = Answers(status.DiligenceID)
            };

            // send email here
            model.Send();
        }

        /// <summary>
        /// Return lead answers
        /// </summary>
        /// <param name="userid">lead id</param>
        /// <returns></returns>
        private IEnumerable<JsonQuestion> Answers(int id)
        {
            var tokenDetails = GetToken();
            var url = string.Format("api/Questionnaires/DiligenceAnswers?id={0}", id);

            using (var handler = new HttpClientHandler())
            {
                using (var client = new HttpClient(handler) { BaseAddress = GetUri() })
                {
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenDetails["access_token"]);
                    using (var response = client.GetAsync(url).Result)
                    {
                        if (response.IsSuccessStatusCode)
                            return JsonConvert.DeserializeObject<IEnumerable<JsonQuestion>>(response.Content.ReadAsStringAsync().Result);
                    }
                }
            }

            return null;

        }


    }

}