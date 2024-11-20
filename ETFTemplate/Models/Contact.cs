using Postal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ETFTemplate.Models
{
    /// <summary>
    /// A class to be connected
    /// </summary>
    public class ContactModel
    {
        /// <summary>
        /// First name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Phone number
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }
    }

    /// <summary>
    /// Class for email
    /// </summary>
    public class ContactRequestEmail : Email
    {
        public string To { get; set; }
        public string From { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
    }

    public class ContactResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }

        public ContactResult() { }
        public ContactResult(Exception exc) {
            Success = false;
            Message = exc.Message;
        }
        public ContactResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

    }
}