using Lili4me.Lead;
using Postal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lili4me.Models
{
    /// <summary>
    /// To launch
    /// </summary>
    public class LeadConnection
    {
        public int QuestionnaireID { get; set; }
    }

    /// <summary>
    /// To display kyc
    /// </summary>
    public class KYCDetails
    {
        /// <summary>
        /// Questionnaire id
        /// </summary>
        public int QuestionnaireID { get; set; }
        /// <summary>
        /// Code of proposal
        /// </summary>
        public string Code { get; set; }
    }

    /// <summary>
    /// To display portfolio
    /// </summary>
    public class LeadDetails
    {
        /// <summary>
        /// Questionnaire id
        /// </summary>
        public int QuestionnaireID { get; set; }
        /// <summary>
        /// Code of proposal
        /// </summary>
        public string Code { get; set; }
    }

    /// <summary>
    /// To confirm a lead connection
    /// </summary>
    public class LeadConfirmation
    {
        /// <summary>
        /// Code of proposal
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Diligence id
        /// </summary>
        public int ID { get; set; }

        /// <summary>
        /// User id
        /// </summary>
        public string UserID { get; set; }

        /// <summary>
        /// Url to call after confirmation
        /// </summary>
        public string CallBackUrl { get; set; }
    }

    /// <summary>
    /// A class to record a new lead
    /// </summary>
    public class LeadConnector
    {
        /// <summary>
        /// Portfolio code
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Portfolio name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Author email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Questionnaire id
        /// </summary>
        public int QuestionnaireID { get; set; }

        /// <summary>
        /// User id
        /// </summary>
        public string UserID { get; set; }

        /// <summary>
        /// Url to confirm
        /// </summary>
        public string ConfirmationUrl { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public LeadConnector()
        {
        }
    }

    /// <summary>
    /// Lead connection status
    /// </summary>
    public class LeadConnectionStatus
    {
        /// <summary>
        /// True if connection has been completed
        /// </summary>
        public bool Success { get; set; }
        /// <summary>
        /// Message connection 
        /// </summary>
        public string Message { get; set; }
        /// <summary>
        /// Portfolio code
        /// </summary>
        public string Code { get; set; }
        /// <summary>
        /// Lead id
        /// </summary>
        public string LeadID { get; set; }
        /// <summary>
        /// Diligence reference
        /// </summary>
        public int DiligenceID { get; set; }
        /// <summary>
        /// Lead email
        /// </summary>
        public string Email { get; set; }

    }

    /// <summary>
    /// A class used to send email when lead must to be confirmed
    /// </summary>
    public class LeadToConfirmEmail : Email
    {
        public string To { get; set; }
        public string From { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string Username { get; set; }
        public string Url { get; set; }
    }

    /// <summary>
    /// A class used to send email when lead must to be confirmed
    /// </summary>
    public class LeadConfirmationEmail : Email
    {
        public string To { get; set; }
        public string From { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string Username { get; set; }
        public IEnumerable<JsonQuestion> Questions { get; set; }
    }
}