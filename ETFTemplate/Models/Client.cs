using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ETFTemplate.Models
{
    /// <summary>
    /// To display client portal
    /// </summary>
    public class ClientPortal
    {
        /// <summary>
        /// Internal code
        /// </summary>
        public string Code { get; set; }
        /// <summary>
        /// Questionnaire for KYC
        /// </summary>
        public int QuestionnaireID { get; set; }
    }

    /// <summary>
    /// Class for order book
    /// </summary>
    public class ClientBook
    {
        /// <summary>
        /// Report ID
        /// </summary>
        public string ReportID { get; set; }

    }
}