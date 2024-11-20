using ETFTemplate.Helpers;
using ETFTemplate.Models;
using ETFTemplate.Services;
using System;
using System.Net.Configuration;
using System.Net.Mail;
using System.Web.Configuration;
using System.Web.Mvc;

namespace ETFTemplate.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = ApplicationHelper.ApplicationName;
            return View();
        }

        public ActionResult About()
        {
            return View();
        }

        public ActionResult Robot()
        {
            return View();
        }

        /// <summary>
        /// GET portal view
        /// </summary>
        /// <returns></returns>
        public ActionResult Portal()
        {
            return View();
        }

        /// <summary>
        /// GET contact
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Contact()
        {
            return View();
        }

        /// <summary>
        /// POST contact request form
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Contact(ContactModel model)
        {
            if (!ModelState.IsValid)
                return Json(new ContactResult(false, "Probleme"));

            // Get setting on web.config
            var config = WebConfigurationManager.OpenWebConfiguration(Request.ApplicationPath);
            var settings = config.GetSectionGroup("system.net/mailSettings") as MailSettingsSectionGroup;

            if (settings == null || settings.Smtp == null || settings.Smtp.Network == null || settings.Smtp.Network.UserName == null)
                return Json(new ContactResult(false, "Error on stmp settings"));

            var message = new ContactRequestEmail()
            {
                Title = "Contact de M. " + model.LastName,
                Body = model.Message,
                ContactName = model.FirstName + " " + model.LastName,
                ContactEmail = model.Email,
                ContactPhone = model.Phone,
                From = ApplicationHelper.ContactEmail,
                To = ApplicationHelper.UserEmail
            };

            try
            {
                message.Send();
                return Json(new ContactResult(true, "OK"));
            }
            catch (Exception exc)
            {
                return Json(exc.Message);
            }
        }
    }
}