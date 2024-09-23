using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lili4me.Lead
{
    /// <summary>
    /// Question
    /// </summary>
    public class JsonQuestion
    {
        /// <summary>
        /// Code
        /// </summary>
        public string Code { get; set; }
        /// <summary>
        /// Name
        /// </summary>
        public string Question { get; set; }
        /// <summary>
        /// Answers
        /// </summary>
        public IEnumerable<JsonAnswer> Answers { get; set; }
    }

    /// <summary>
    /// Answer for one question
    /// </summary>
    public class JsonAnswer
    {
        /// <summary>
        /// The numerical value of the answer
        /// </summary>
        public int Value { get; set; }
        /// <summary>
        /// Answer
        /// </summary>
        public string Answer { get; set; }
        /// <summary>
        /// The numerical value of the answer
        /// </summary>
        public int Rank { get; set; }
        /// <summary>
        /// Answer code
        /// </summary>
        public string Code { get; set; }
    }
}