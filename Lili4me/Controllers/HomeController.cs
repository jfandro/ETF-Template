﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace Lili4me.Controllers
{
    public class HomeController : Controller
    {
        private const string baseUrl = "http://localhost:64629";
        //private const string baseUrl = "https://etfreporting.com";

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Allocations()
        {
            return View();
        }

        public ActionResult Create()
        {
            return View();
        }

        public ActionResult Upload()
        {
            return View();
        }
        public ActionResult Positions()
        {
            return View();
        }
        public ActionResult Momentum()
        {
            return View();
        }

        public ActionResult Liabilities()
        {
            return View();
        }

        public ActionResult Universes()
        {
            return View();
        }

        public ActionResult Benchmark()
        {
            return View();
        }

        public ActionResult Operations()
        {
            return View();
        }
        public ActionResult Board()
        {
            return View();
        }

        public ActionResult Book()
        {
            return View();
        }
            
        public ActionResult MyFund()
        {
            return View();
        }
        public ActionResult Robo()
        {
            return View();
        }
        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult Aix()
        {
            return View();
        }

    }
}