using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ETFTemplate
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.MapRoute("Robot", "Robot", new { controller = "Lead", action = "Index" });
            routes.MapRoute("ClientPortal", "ClientPortal", new { controller = "Client", action = "Index" });
            routes.MapRoute("OrderBook", "OrderBook", new { controller = "Client", action = "Book" });

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
