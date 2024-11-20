using ETFTemplate.Helpers;
using System.Configuration;
using System.Web;
using System.Web.Optimization;

namespace ETFTemplate
{
    public class BundleConfig
    {
        // Pour plus d'informations sur le regroupement, visitez https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Utilisez la version de développement de Modernizr pour le développement et l'apprentissage. Puis, une fois
            // prêt pour la production, utilisez l'outil de génération à l'adresse https://modernizr.com pour sélectionner uniquement les tests dont vous avez besoin.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js"));

            var bndscripts = new ScriptBundle("~/bundles/controllers", "~/bundles/controllers").Include(
              "~/Scripts/settings.js",
              "~/Scripts/session.js",
              "~/Scripts/controllers/assetsController-1.2.js",
              "~/Scripts/controllers/containersController-2.5.js",
              "~/Scripts/controllers/credentialsController-1.1.js",
              "~/Scripts/controllers/customersController-1.3.js",
              "~/Scripts/controllers/instrumentsController-1.2.js",
              "~/Scripts/controllers/leadsController-1.2.js",
              "~/Scripts/controllers/operationsController-1.2.js",
              "~/Scripts/controllers/portfoliosController-1.2.js",
              "~/Scripts/controllers/questionnairesController-1.6.js",
              "~/Scripts/controllers/roboController-2.4.js",
              "~/Scripts/controllers/signinController-1.0.js",
              "~/Scripts/controllers/universesController-1.2.js");

            if (ApplicationHelper.RoboScript != "")
                bndscripts.Include(ApplicationHelper.RoboScript);
            bundles.Add(bndscripts);

            var bnd = new StyleBundle("~/Content/css").Include(
                      "~/Content/Local/mybootstrap-5.0.css",
                      "~/Content/Local/myrobo-5.0.css",
                      "~/Content/Local/mydataviz-5.0.css");

            if (ApplicationHelper.ExtendedStyle != "")
                bnd.Include(ApplicationHelper.ExtendedStyle);
            bundles.Add(bnd);

        }
    }
}
