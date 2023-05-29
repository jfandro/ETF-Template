using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace ETFReporting.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Features()
        {
            return View();
        }

        public ActionResult Howto()
        {
            return View();
        }

        /// <summary>
        /// Download a sample of file ready to be uploaded
        /// </summary>
        /// <param name="name">file name</param>
        /// <returns></returns>
        public FileResult DownloadSample(string name)
        {
            string path = Server.MapPath("~/Samples/") + name;
            
            //Read the File data into Byte Array.
            byte[] bytes = System.IO.File.ReadAllBytes(path);

            //Send the File to Download.
            return File(bytes, "text/csv", name);
        }
    }
}