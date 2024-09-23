using System;
using System.Web.Mvc;

namespace ETFTemplate.Helpers
{
    /// <summary>
    /// static class for url management
    /// </summary>
    public static class ApplicationUrlHelper
    {
        /// <summary>
        /// Returns an absolute url for an action
        /// </summary>
        /// <param name="url">UrlHelper</param>
        /// <param name="action"></param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static string AbsoluteAction(this UrlHelper url, string action, object routeValues)
        {
            Uri requestUrl = url.RequestContext.HttpContext.Request.Url;
            string absoluteAction = string.Format("{0}://{1}{2}",
                                                  requestUrl.Scheme,
                                                  requestUrl.Authority,
                                                  url.Action(action, routeValues));
            return absoluteAction;
        }

        /// <summary>
        /// Returns an absolute url for an action
        /// </summary>
        /// <param name="url">UrlHelper</param>
        /// <param name="action"></param>
        /// <param name="controller">controller</param>
        /// <param name="routeValues"></param>
        /// <returns></returns>
        public static string AbsoluteAction(this UrlHelper url, string action, string controller, object routeValues)
        {
            Uri requestUrl = url.RequestContext.HttpContext.Request.Url;

            string absoluteAction = string.Format("{0}://{1}{2}",
                                                  requestUrl.Scheme,
                                                  requestUrl.Authority,
                                                  url.Action(action, controller, routeValues));

            return absoluteAction;
        }
    }
}