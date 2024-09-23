using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net.Http;
using Newtonsoft.Json;

namespace ETFTemplate.Controllers
{
    public abstract partial class ApplicationController : Controller
    {

        private readonly string baseUrl = "http://localhost:64629";

        /// <summary>
        /// Return Uri of server
        /// </summary>
        /// <returns></returns>
        public Uri GetUri()
        {
            return new Uri(baseUrl);
        }

        /// <summary>
        /// Get token
        /// </summary>
        /// <returns></returns>
        public Dictionary<string, string> GetToken()
        {
            // Create a list of keys for credentials
            var requestParams = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("grant_type", "password"),
                    new KeyValuePair<string, string>("username", ConfigurationManager.AppSettings.Get("UserName")),
                    new KeyValuePair<string, string>("password", ConfigurationManager.AppSettings.Get("UserPassword"))
                };

            var baseUri = new Uri(baseUrl);
            var requestParamsFormUrlEncoded = new FormUrlEncodedContent(requestParams);

            using (var handler = new HttpClientHandler())
            {
                using (var client = new HttpClient(handler) { BaseAddress = baseUri })
                {
                    using (var response = client.PostAsync("token", requestParamsFormUrlEncoded).Result)
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var tokenDetails = JsonConvert.DeserializeObject<Dictionary<string, string>>(response.Content.ReadAsStringAsync().Result);
                            if (tokenDetails != null && tokenDetails.Any())
                                return tokenDetails;
                        }
                    }
                }
            }

            return new Dictionary<string, string>();
        }
    }

}