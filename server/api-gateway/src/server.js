require("dotenv").config();
const express = require("express");
const proxy = require("express-http-proxy");
const cors = require("cors");
const helmet = require("helmet");
const authMiddleware = require("./middleware/auth-middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`\n[GATEWAY] Incoming: ${req.method} ${req.originalUrl}`);
  console.log(`[GATEWAY] Auth header present: ${!!req.headers["authorization"]}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const resolved = req.originalUrl.replace(/^\/v1/, "/api");
    console.log(`[PROXY] Path resolved: ${req.originalUrl} → ${resolved}`);
    return resolved;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};

    console.log(`[PROXY] Decorating headers...`);
    console.log(`[PROXY] x-user-id from srcReq: ${srcReq.headers["x-user-id"]}`);
    console.log(`[PROXY] x-user-email from srcReq: ${srcReq.headers["x-user-email"]}`);

    if (srcReq.headers["x-user-id"]) {
      proxyReqOpts.headers["x-user-id"] = srcReq.headers["x-user-id"];
    }
    if (srcReq.headers["x-user-email"]) {
      proxyReqOpts.headers["x-user-email"] = srcReq.headers["x-user-email"];
    }
    if (srcReq.headers["x-user-name"]) {
      proxyReqOpts.headers["x-user-name"] = srcReq.headers["x-user-name"];
    }

    Object.keys(proxyReqOpts.headers).forEach((key) => {
      if (proxyReqOpts.headers[key] == null || proxyReqOpts.headers[key] === "undefined") {
        delete proxyReqOpts.headers[key];
      }
    });

    console.log(
      `[PROXY] Final headers being forwarded:`,
      JSON.stringify(proxyReqOpts.headers, null, 2)
    );
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error(`[PROXY ERROR] Type: ${err.code || "unknown"}`);
    console.error(`[PROXY ERROR] Message: ${err.message}`);
    console.error(`[PROXY ERROR] Stack: ${err.stack}`);
    res.status(500).json({
      message: "Internal server error!",
      error: err.message,
    });
  },
};

app.use(
  "/v1/designs",
  (req, res, next) => {
    console.log(`[GATEWAY] Reached /v1/designs route — running auth...`);
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log(`[GATEWAY] Auth passed! userId=${req.user?.userId}`);
    console.log(`[GATEWAY] Forwarding to design service: ${process.env.DESIGN}`);
    next();
  },
  proxy(process.env.DESIGN, {
    ...proxyOptions,
  })
);

app.use(
  "/v1/media",
  authMiddleware,
  proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody: false,
  })
);

/* Some extra logic we need to handle later */

app.use(
  "/v1/subscription",
  authMiddleware,
  proxy(process.env.SUBSCRIPTION, {
    ...proxyOptions,
    parseReqBody: false,
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`Design Service is running on port ${process.env.DESIGN}`);
  console.log(`Upload Service is running on port ${process.env.UPLOAD}`);
  console.log(`Subscription Service is running on port ${process.env.SUBSCRIPTION}`);
});
