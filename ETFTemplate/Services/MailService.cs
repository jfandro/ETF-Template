using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Configuration;
using System.Net.Mail;
using System.Web;
using System.Web.Configuration;

namespace ETFTemplate.Services
{
    public class MailService
    {

        private readonly MailSettingsSectionGroup _settings;

        public SmtpClient SmtpClient { get; private set; }
        public string InfoService { get; set; }
        public string AdminService { get; set; }
        public string InvoiceService { get; set; }
        public string TrainingService { get; set; }
        public string AdminServiceName { get; set; }
        public string InfoServiceName { get; set; }
        public string InvoiceServiceName { get; set; }

        /// <summary>
        /// True is for test and Training
        /// </summary>
        public bool RedirectToTraining { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public MailService()
        {

            // Get setting on web.config
            var config = WebConfigurationManager.OpenWebConfiguration(HttpContext.Current.Request.ApplicationPath);
            _settings = config.GetSectionGroup("system.net/mailSettings") as MailSettingsSectionGroup;

            var cr1 = new System.Net.NetworkCredential("jbaumgarten@jb-solutions-patrimoine.fr", "HUZqmEWT68!*");
            var cr2 = new System.Net.NetworkCredential("jfandro41@gmail.com", "valmarfla");
            var cr3 = new System.Net.NetworkCredential("admin@etfreporting.com", "€tfR€porting2024");
            var cr4 = new System.Net.NetworkCredential("contact@jb-solutions-patrimoine", "PZAvjYQE68!*md57");

            SmtpClient = new SmtpClient
            {
                Host = "smtp.gandi.net",
                Port = 25,
                Timeout = 10000,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = cr3
            };
        }

        /// <summary>
        /// Send an email using Smtp settings
        /// </summary>
        /// <param name="fromAddress"></param>
        /// <param name="toAddress"></param>
        /// <param name="subject"></param>
        /// <param name="body"></param>
        public void SendEmail(MailAddress fromAddress, MailAddress toAddress, string subject, string body)
        {
            var message = new MailMessage(fromAddress, toAddress) { Subject = subject, Body = body, IsBodyHtml = true };
            SmtpClient.Send(message);
        }

        /// <summary>
        /// Send an email with notification
        /// </summary>
        /// <param name="fromAddress"></param>
        /// <param name="toAddress"></param>
        /// <param name="subject"></param>
        /// <param name="body"></param>
        /// <param name="notificationTo"></param>
        public void SendEmail(MailAddress fromAddress, MailAddress toAddress, string subject, string body, MailAddress notificationTo)
        {
            var message = new MailMessage(fromAddress, toAddress) { Subject = subject, Body = body, IsBodyHtml = true };
            message.Headers.Add("Disposition-Notification-To", notificationTo.Address);
            SmtpClient.Send(message);
        }

        /// <summary>
        /// Get the email address of administrator
        /// </summary>
        public MailAddress AdministratorMail
        {
            get { return new MailAddress(AdminService, AdminServiceName); }
        }

        /// <summary>
        /// Get the email address of invoice service
        /// </summary>
        public MailAddress InvoiceMail
        {
            get { return new MailAddress(InvoiceService, InvoiceServiceName); }
        }

        /// <summary>
        /// Get the email address of information service
        /// </summary>
        public MailAddress InformationMail
        {
            get { return new MailAddress(InfoService, InfoServiceName); }
        }

    }

}