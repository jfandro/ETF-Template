using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Lili4me.Models;

namespace Lili4me.Controllers
{
    /// <summary>
    /// Client controller
    /// </summary>
    public class ClientController : ApplicationController
    {
        private readonly int questionnaireid = Convert.ToInt32(ConfigurationManager.AppSettings.Get("LeadQuestionnaire"));
        private readonly string issuer = ConfigurationManager.AppSettings.Get("LeadEmail");


        /// <summary>
        /// Get client portal
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Index(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new ClientPortal() { Code = id, QuestionnaireID = questionnaireid };
            return View(model);
        }


        /// <summary>
        /// Book form
        /// </summary>
        /// <returns></returns>
        public ActionResult Book(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new ClientBook() { ReportID = id };
            return View(model);
        }

        /// <summary>
        /// Get KYC
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult KYC(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new KYCDetails() { QuestionnaireID = questionnaireid, Code = id };
            return View(model);
        }

        /// <summary>
        /// Get client operations dashboard
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Operations(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new ClientPortal() { Code = id };
            return View(model);
        }

        /// <summary>
        /// Get client funds documents
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Documents(string id)
        {
            var tokenDetails = GetToken();
            ViewBag.token = tokenDetails["access_token"];
            ViewBag.expires = tokenDetails["expires_in"];

            var model = new ClientPortal() { Code = id };
            return View(model);
        }
    }
}