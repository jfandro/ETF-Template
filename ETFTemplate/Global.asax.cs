using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace ETFTemplate
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {

            // Starting 10 October 2017 developers must use TLS 1.1 or 1.2 when calling LinkedIn APIs. 
            // LinkedIn no longer supports TLS 1.0 for security reasons.
            //if (ServicePointManager.SecurityProtocol.HasFlag(SecurityProtocolType.Tls12) == false)
            //    ServicePointManager.SecurityProtocol = ServicePointManager.SecurityProtocol | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;


            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleTable.EnableOptimizations = true;
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
