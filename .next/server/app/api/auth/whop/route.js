/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/whop/route";
exports.ids = ["app/api/auth/whop/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/whop/route.ts":
/*!************************************!*\
  !*** ./app/api/auth/whop/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   HEAD: () => (/* binding */ HEAD),\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   PATCH: () => (/* binding */ PATCH),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   PUT: () => (/* binding */ PUT),\n/* harmony export */   getCurrentSession: () => (/* binding */ getCurrentSession)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_app_render_work_unit_async_storage_external_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/app-render/work-unit-async-storage.external.js */ \"./work-unit-async-storage.external\");\n/* harmony import */ var next_dist_server_app_render_work_unit_async_storage_external_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_app_render_work_unit_async_storage_external_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/env */ \"(rsc)/./lib/env.ts\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n/* harmony import */ var _sentry_nextjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/nextjs */ \"(rsc)/./node_modules/@sentry/nextjs/build/cjs/index.server.js\");\n/* harmony import */ var _sentry_nextjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_sentry_nextjs__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n\nfunction buildWhopLoginUrl(origin, redirectParam) {\n    const appId = _lib_env__WEBPACK_IMPORTED_MODULE_2__.env.whopAppId();\n    const loginBase = _lib_env__WEBPACK_IMPORTED_MODULE_2__.env.whopLoginUrl();\n    const redirectTarget = redirectParam ?? `${origin}/dashboard`;\n    const url = new URL(loginBase);\n    // Support multiple parameter spellings used across Whop docs/versions.\n    url.searchParams.set(\"app_id\", appId);\n    url.searchParams.set(\"appId\", appId);\n    url.searchParams.set(\"redirect_uri\", redirectTarget);\n    url.searchParams.set(\"redirectUrl\", redirectTarget);\n    return url.toString();\n}\nasync function GET$1(request) {\n    const origin = _lib_env__WEBPACK_IMPORTED_MODULE_2__.env.appUrl() || request.nextUrl.origin;\n    const redirectParam = request.nextUrl.searchParams.get(\"redirect\");\n    const whopUserId = request.headers.get(\"x-whop-user-id\");\n    // If the request is already coming from the Whop runtime, hand off to the\n    // enrichment flow that expects Whop headers to be present.\n    if (whopUserId) {\n        const connectUrl = new URL(\"/api/auth/connect/whop\", origin);\n        const incomingSearch = request.nextUrl.search;\n        if (incomingSearch) {\n            connectUrl.search = incomingSearch;\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(connectUrl.toString(), {\n            status: 302\n        });\n    }\n    // Otherwise, bounce the user to the hosted Whop login experience. Once\n    // authenticated, Whop will reopen the embedded app with the appropriate\n    // session headers so the button can succeed on the next attempt.\n    const loginUrl = buildWhopLoginUrl(origin, redirectParam);\n    return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(loginUrl, {\n        status: 302\n    });\n}\nasync function getCurrentSession() {\n    const headerList = (0,next_headers__WEBPACK_IMPORTED_MODULE_3__.headers)();\n    const whopUserId = headerList.get(\"x-whop-user-id\");\n    const sessionToken = headerList.get(\"x-whop-session-token\");\n    if (!whopUserId || !sessionToken) {\n        return null; // fall back to manual login or redirect\n    }\n    return {\n        whopUserId,\n        sessionToken\n    };\n}\n\n// @ts-expect-error Because we cannot be sure if the RequestAsyncStorage module exists (it is not part of the Next.js public\n// API) we use a shim if it doesn't exist. The logic for this is in the wrapping loader.\n\nconst asyncStorageModule = { ...next_dist_server_app_render_work_unit_async_storage_external_js__WEBPACK_IMPORTED_MODULE_0__ } ;\n\nconst requestAsyncStorage =\n  'workUnitAsyncStorage' in asyncStorageModule\n    ? asyncStorageModule.workUnitAsyncStorage\n    : 'requestAsyncStorage' in asyncStorageModule\n      ? asyncStorageModule.requestAsyncStorage\n      : undefined;\n\nfunction wrapHandler(handler, method) {\n  // Running the instrumentation code during the build phase will mark any function as \"dynamic\" because we're accessing\n  // the Request object. We do not want to turn handlers dynamic so we skip instrumentation in the build phase.\n  if (process.env.NEXT_PHASE === 'phase-production-build') {\n    return handler;\n  }\n\n  if (typeof handler !== 'function') {\n    return handler;\n  }\n\n  return new Proxy(handler, {\n    apply: (originalFunction, thisArg, args) => {\n      let headers = undefined;\n\n      // We try-catch here just in case the API around `requestAsyncStorage` changes unexpectedly since it is not public API\n      try {\n        const requestAsyncStore = requestAsyncStorage?.getStore();\n        headers = requestAsyncStore?.headers;\n      } catch {\n        /** empty */\n      }\n\n      // eslint-disable-next-line @typescript-eslint/no-explicit-any\n      return _sentry_nextjs__WEBPACK_IMPORTED_MODULE_4__.wrapRouteHandlerWithSentry(originalFunction , {\n        method,\n        parameterizedRoute: '/api/auth/whop',\n        headers,\n      }).apply(thisArg, args);\n    },\n  });\n}\n\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst GET = wrapHandler(GET$1 , 'GET');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst POST = wrapHandler(undefined , 'POST');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst PUT = wrapHandler(undefined , 'PUT');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst PATCH = wrapHandler(undefined , 'PATCH');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst DELETE = wrapHandler(undefined , 'DELETE');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst HEAD = wrapHandler(undefined , 'HEAD');\n// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access\nconst OPTIONS = wrapHandler(undefined , 'OPTIONS');\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQ0MsU0FBMEIsR0FBRyxNQUFNO0FBQzVEO0FBQ0ssTUFBQyxPQUFPLEdBQUcsV0FBVyxDQUFDQyxTQUE2QixHQUFHLFNBQVMiLCJzb3VyY2VzIjpbImFwcC9hcGkvYXV0aC93aG9wL3JvdXRlLnRzIiwic2VudHJ5LXdyYXBwZXItbW9kdWxlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgZW52IH0gZnJvbSBcIkAvbGliL2VudlwiO1xyXG5pbXBvcnQgeyBoZWFkZXJzIH0gZnJvbSBcIm5leHQvaGVhZGVyc1wiO1xyXG5cclxuZnVuY3Rpb24gYnVpbGRXaG9wTG9naW5Vcmwob3JpZ2luOiBzdHJpbmcsIHJlZGlyZWN0UGFyYW06IHN0cmluZyB8IG51bGwpOiBzdHJpbmcge1xyXG5cdGNvbnN0IGFwcElkID0gZW52Lndob3BBcHBJZCgpO1xyXG5cdGNvbnN0IGxvZ2luQmFzZSA9IGVudi53aG9wTG9naW5VcmwoKTtcclxuXHRjb25zdCByZWRpcmVjdFRhcmdldCA9IHJlZGlyZWN0UGFyYW0gPz8gYCR7b3JpZ2lufS9kYXNoYm9hcmRgO1xyXG5cclxuXHRjb25zdCB1cmwgPSBuZXcgVVJMKGxvZ2luQmFzZSk7XHJcblxyXG5cdC8vIFN1cHBvcnQgbXVsdGlwbGUgcGFyYW1ldGVyIHNwZWxsaW5ncyB1c2VkIGFjcm9zcyBXaG9wIGRvY3MvdmVyc2lvbnMuXHJcblx0dXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJhcHBfaWRcIiwgYXBwSWQpO1xyXG5cdHVybC5zZWFyY2hQYXJhbXMuc2V0KFwiYXBwSWRcIiwgYXBwSWQpO1xyXG5cdHVybC5zZWFyY2hQYXJhbXMuc2V0KFwicmVkaXJlY3RfdXJpXCIsIHJlZGlyZWN0VGFyZ2V0KTtcclxuXHR1cmwuc2VhcmNoUGFyYW1zLnNldChcInJlZGlyZWN0VXJsXCIsIHJlZGlyZWN0VGFyZ2V0KTtcclxuXHJcblx0cmV0dXJuIHVybC50b1N0cmluZygpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XHJcblx0Y29uc3Qgb3JpZ2luID0gZW52LmFwcFVybCgpIHx8IHJlcXVlc3QubmV4dFVybC5vcmlnaW47XHJcblx0Y29uc3QgcmVkaXJlY3RQYXJhbSA9IHJlcXVlc3QubmV4dFVybC5zZWFyY2hQYXJhbXMuZ2V0KFwicmVkaXJlY3RcIik7XHJcblx0Y29uc3Qgd2hvcFVzZXJJZCA9IHJlcXVlc3QuaGVhZGVycy5nZXQoXCJ4LXdob3AtdXNlci1pZFwiKTtcclxuXHJcblx0Ly8gSWYgdGhlIHJlcXVlc3QgaXMgYWxyZWFkeSBjb21pbmcgZnJvbSB0aGUgV2hvcCBydW50aW1lLCBoYW5kIG9mZiB0byB0aGVcclxuXHQvLyBlbnJpY2htZW50IGZsb3cgdGhhdCBleHBlY3RzIFdob3AgaGVhZGVycyB0byBiZSBwcmVzZW50LlxyXG5cdGlmICh3aG9wVXNlcklkKSB7XHJcblx0XHRjb25zdCBjb25uZWN0VXJsID0gbmV3IFVSTChcIi9hcGkvYXV0aC9jb25uZWN0L3dob3BcIiwgb3JpZ2luKTtcclxuXHRcdGNvbnN0IGluY29taW5nU2VhcmNoID0gcmVxdWVzdC5uZXh0VXJsLnNlYXJjaDtcclxuXHRcdGlmIChpbmNvbWluZ1NlYXJjaCkge1xyXG5cdFx0XHRjb25uZWN0VXJsLnNlYXJjaCA9IGluY29taW5nU2VhcmNoO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBOZXh0UmVzcG9uc2UucmVkaXJlY3QoY29ubmVjdFVybC50b1N0cmluZygpLCB7IHN0YXR1czogMzAyIH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gT3RoZXJ3aXNlLCBib3VuY2UgdGhlIHVzZXIgdG8gdGhlIGhvc3RlZCBXaG9wIGxvZ2luIGV4cGVyaWVuY2UuIE9uY2VcclxuXHQvLyBhdXRoZW50aWNhdGVkLCBXaG9wIHdpbGwgcmVvcGVuIHRoZSBlbWJlZGRlZCBhcHAgd2l0aCB0aGUgYXBwcm9wcmlhdGVcclxuXHQvLyBzZXNzaW9uIGhlYWRlcnMgc28gdGhlIGJ1dHRvbiBjYW4gc3VjY2VlZCBvbiB0aGUgbmV4dCBhdHRlbXB0LlxyXG5cdGNvbnN0IGxvZ2luVXJsID0gYnVpbGRXaG9wTG9naW5Vcmwob3JpZ2luLCByZWRpcmVjdFBhcmFtKTtcclxuXHJcblx0cmV0dXJuIE5leHRSZXNwb25zZS5yZWRpcmVjdChsb2dpblVybCwgeyBzdGF0dXM6IDMwMiB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRTZXNzaW9uKCkge1xyXG4gIGNvbnN0IGhlYWRlckxpc3QgPSBoZWFkZXJzKCk7XHJcbiAgY29uc3Qgd2hvcFVzZXJJZCA9IGhlYWRlckxpc3QuZ2V0KFwieC13aG9wLXVzZXItaWRcIik7XHJcbiAgY29uc3Qgc2Vzc2lvblRva2VuID0gaGVhZGVyTGlzdC5nZXQoXCJ4LXdob3Atc2Vzc2lvbi10b2tlblwiKTtcclxuXHJcbiAgaWYgKCF3aG9wVXNlcklkIHx8ICFzZXNzaW9uVG9rZW4pIHtcclxuICAgIHJldHVybiBudWxsOyAvLyBmYWxsIGJhY2sgdG8gbWFudWFsIGxvZ2luIG9yIHJlZGlyZWN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyB3aG9wVXNlcklkLCBzZXNzaW9uVG9rZW4gfTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBvcmlnTW9kdWxlIGZyb20gJ25leHQvZGlzdC9zZXJ2ZXIvYXBwLXJlbmRlci93b3JrLXVuaXQtYXN5bmMtc3RvcmFnZS5leHRlcm5hbC5qcyc7XG5pbXBvcnQgKiBhcyBzZXJ2ZXJDb21wb25lbnRNb2R1bGUgZnJvbSAnX19TRU5UUllfV1JBUFBJTkdfVEFSR0VUX0ZJTEVfXy5janMnO1xuZXhwb3J0ICogZnJvbSAnX19TRU5UUllfV1JBUFBJTkdfVEFSR0VUX0ZJTEVfXy5janMnO1xuZXhwb3J0IHt9IGZyb20gJ19fU0VOVFJZX1dSQVBQSU5HX1RBUkdFVF9GSUxFX18uY2pzJztcbmltcG9ydCAqIGFzIFNlbnRyeSBmcm9tICdAc2VudHJ5L25leHRqcyc7XG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgQmVjYXVzZSB3ZSBjYW5ub3QgYmUgc3VyZSBpZiB0aGUgUmVxdWVzdEFzeW5jU3RvcmFnZSBtb2R1bGUgZXhpc3RzIChpdCBpcyBub3QgcGFydCBvZiB0aGUgTmV4dC5qcyBwdWJsaWNcbi8vIEFQSSkgd2UgdXNlIGEgc2hpbSBpZiBpdCBkb2Vzbid0IGV4aXN0LiBUaGUgbG9naWMgZm9yIHRoaXMgaXMgaW4gdGhlIHdyYXBwaW5nIGxvYWRlci5cblxuY29uc3QgYXN5bmNTdG9yYWdlTW9kdWxlID0geyAuLi5vcmlnTW9kdWxlIH0gO1xuXG5jb25zdCByZXF1ZXN0QXN5bmNTdG9yYWdlID1cbiAgJ3dvcmtVbml0QXN5bmNTdG9yYWdlJyBpbiBhc3luY1N0b3JhZ2VNb2R1bGVcbiAgICA/IGFzeW5jU3RvcmFnZU1vZHVsZS53b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIDogJ3JlcXVlc3RBc3luY1N0b3JhZ2UnIGluIGFzeW5jU3RvcmFnZU1vZHVsZVxuICAgICAgPyBhc3luY1N0b3JhZ2VNb2R1bGUucmVxdWVzdEFzeW5jU3RvcmFnZVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHdyYXBIYW5kbGVyKGhhbmRsZXIsIG1ldGhvZCkge1xuICAvLyBSdW5uaW5nIHRoZSBpbnN0cnVtZW50YXRpb24gY29kZSBkdXJpbmcgdGhlIGJ1aWxkIHBoYXNlIHdpbGwgbWFyayBhbnkgZnVuY3Rpb24gYXMgXCJkeW5hbWljXCIgYmVjYXVzZSB3ZSdyZSBhY2Nlc3NpbmdcbiAgLy8gdGhlIFJlcXVlc3Qgb2JqZWN0LiBXZSBkbyBub3Qgd2FudCB0byB0dXJuIGhhbmRsZXJzIGR5bmFtaWMgc28gd2Ugc2tpcCBpbnN0cnVtZW50YXRpb24gaW4gdGhlIGJ1aWxkIHBoYXNlLlxuICBpZiAocHJvY2Vzcy5lbnYuTkVYVF9QSEFTRSA9PT0gJ3BoYXNlLXByb2R1Y3Rpb24tYnVpbGQnKSB7XG4gICAgcmV0dXJuIGhhbmRsZXI7XG4gIH1cblxuICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaGFuZGxlcjtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJveHkoaGFuZGxlciwge1xuICAgIGFwcGx5OiAob3JpZ2luYWxGdW5jdGlvbiwgdGhpc0FyZywgYXJncykgPT4ge1xuICAgICAgbGV0IGhlYWRlcnMgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIFdlIHRyeS1jYXRjaCBoZXJlIGp1c3QgaW4gY2FzZSB0aGUgQVBJIGFyb3VuZCBgcmVxdWVzdEFzeW5jU3RvcmFnZWAgY2hhbmdlcyB1bmV4cGVjdGVkbHkgc2luY2UgaXQgaXMgbm90IHB1YmxpYyBBUElcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RBc3luY1N0b3JlID0gcmVxdWVzdEFzeW5jU3RvcmFnZT8uZ2V0U3RvcmUoKTtcbiAgICAgICAgaGVhZGVycyA9IHJlcXVlc3RBc3luY1N0b3JlPy5oZWFkZXJzO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8qKiBlbXB0eSAqL1xuICAgICAgfVxuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgcmV0dXJuIFNlbnRyeS53cmFwUm91dGVIYW5kbGVyV2l0aFNlbnRyeShvcmlnaW5hbEZ1bmN0aW9uICwge1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIHBhcmFtZXRlcml6ZWRSb3V0ZTogJy9hcGkvYXV0aC93aG9wJyxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgIH0pLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIH0sXG4gIH0pO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1tZW1iZXItYWNjZXNzXG5jb25zdCBHRVQgPSB3cmFwSGFuZGxlcihzZXJ2ZXJDb21wb25lbnRNb2R1bGUuR0VUICwgJ0dFVCcpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtbWVtYmVyLWFjY2Vzc1xuY29uc3QgUE9TVCA9IHdyYXBIYW5kbGVyKHNlcnZlckNvbXBvbmVudE1vZHVsZS5QT1NUICwgJ1BPU1QnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLW1lbWJlci1hY2Nlc3NcbmNvbnN0IFBVVCA9IHdyYXBIYW5kbGVyKHNlcnZlckNvbXBvbmVudE1vZHVsZS5QVVQgLCAnUFVUJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1tZW1iZXItYWNjZXNzXG5jb25zdCBQQVRDSCA9IHdyYXBIYW5kbGVyKHNlcnZlckNvbXBvbmVudE1vZHVsZS5QQVRDSCAsICdQQVRDSCcpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtbWVtYmVyLWFjY2Vzc1xuY29uc3QgREVMRVRFID0gd3JhcEhhbmRsZXIoc2VydmVyQ29tcG9uZW50TW9kdWxlLkRFTEVURSAsICdERUxFVEUnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLW1lbWJlci1hY2Nlc3NcbmNvbnN0IEhFQUQgPSB3cmFwSGFuZGxlcihzZXJ2ZXJDb21wb25lbnRNb2R1bGUuSEVBRCAsICdIRUFEJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1tZW1iZXItYWNjZXNzXG5jb25zdCBPUFRJT05TID0gd3JhcEhhbmRsZXIoc2VydmVyQ29tcG9uZW50TW9kdWxlLk9QVElPTlMgLCAnT1BUSU9OUycpO1xuXG5leHBvcnQgeyBERUxFVEUsIEdFVCwgSEVBRCwgT1BUSU9OUywgUEFUQ0gsIFBPU1QsIFBVVCB9O1xuIl0sIm5hbWVzIjpbImJ1aWxkV2hvcExvZ2luVXJsIiwib3JpZ2luIiwicmVkaXJlY3RQYXJhbSIsImFwcElkIiwiZW52Iiwid2hvcEFwcElkIiwibG9naW5CYXNlIiwid2hvcExvZ2luVXJsIiwicmVkaXJlY3RUYXJnZXQiLCJ1cmwiLCJVUkwiLCJzZWFyY2hQYXJhbXMiLCJzZXQiLCJ0b1N0cmluZyIsIkdFVCIsInJlcXVlc3QiLCJhcHBVcmwiLCJuZXh0VXJsIiwiZ2V0Iiwid2hvcFVzZXJJZCIsImhlYWRlcnMiLCJjb25uZWN0VXJsIiwiaW5jb21pbmdTZWFyY2giLCJzZWFyY2giLCJOZXh0UmVzcG9uc2UiLCJyZWRpcmVjdCIsInN0YXR1cyIsImxvZ2luVXJsIiwiZ2V0Q3VycmVudFNlc3Npb24iLCJoZWFkZXJMaXN0Iiwic2Vzc2lvblRva2VuIiwic2VydmVyQ29tcG9uZW50TW9kdWxlLkdFVCIsInNlcnZlckNvbXBvbmVudE1vZHVsZS5QT1NUIiwic2VydmVyQ29tcG9uZW50TW9kdWxlLlBVVCIsInNlcnZlckNvbXBvbmVudE1vZHVsZS5QQVRDSCIsInNlcnZlckNvbXBvbmVudE1vZHVsZS5ERUxFVEUiLCJzZXJ2ZXJDb21wb25lbnRNb2R1bGUuSEVBRCIsInNlcnZlckNvbXBvbmVudE1vZHVsZS5PUFRJT05TIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/whop/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/env.ts":
/*!********************!*\
  !*** ./lib/env.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   env: () => (/* binding */ env)\n/* harmony export */ });\nconst requiredServerEnv = [\n    \"WHOP_API_KEY\",\n    \"NEXT_PUBLIC_WHOP_APP_ID\",\n    \"NEXT_PUBLIC_WHOP_AGENT_USER_ID\",\n    \"NEXT_PUBLIC_WHOP_COMPANY_ID\",\n    \"APPWRITE_ENDPOINT\",\n    \"APPWRITE_PROJECT_ID\",\n    \"APPWRITE_DATABASE_ID\",\n    \"APPWRITE_USERS_COLLECTION_ID\",\n    \"APPWRITE_POSTS_COLLECTION_ID\",\n    \"APPWRITE_AUTOMATIONS_COLLECTION_ID\",\n    \"APPWRITE_LOGS_COLLECTION_ID\",\n    \"APPWRITE_CONNECTIONS_COLLECTION_ID\",\n    \"APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID\",\n    \"APPWRITE_API_KEY\",\n    \"APPWRITE_MEDIA_BUCKET_ID\",\n    \"APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID\",\n    \"APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID\",\n    \"APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID\",\n    \"APPWRITE_FUNCTION_AUTH_REDIRECT_ID\",\n    \"YOUTUBE_CLIENT_ID\",\n    \"YOUTUBE_CLIENT_SECRET\",\n    \"YOUTUBE_REDIRECT_URI\",\n    \"INSTAGRAM_ACCESS_TOKEN\",\n    \"INSTAGRAM_BUSINESS_ID\",\n    \"DISCORD_CLIENT_ID\",\n    \"DISCORD_CLIENT_SECRET\",\n    \"DISCORD_REDIRECT_URI\",\n    \"WHOP_CLIENT_ID\",\n    \"WHOP_CLIENT_SECRET\",\n    \"WHOP_REDIRECT_URI\"\n];\nconst envCache = new Map();\nfunction readEnv(key, fallback) {\n    if (envCache.has(key)) {\n        return envCache.get(key);\n    }\n    const value = process.env[key] ?? fallback;\n    if (!value || value.length === 0) {\n        if (requiredServerEnv.includes(key)) {\n            throw new Error(`Missing required environment variable: ${key}`);\n        }\n    }\n    envCache.set(key, value ?? \"\");\n    return value ?? \"\";\n}\nconst env = {\n    whopApiKey: ()=>readEnv(\"WHOP_API_KEY\"),\n    whopAppId: ()=>readEnv(\"NEXT_PUBLIC_WHOP_APP_ID\"),\n    whopAgentUserId: ()=>readEnv(\"NEXT_PUBLIC_WHOP_AGENT_USER_ID\"),\n    whopCompanyId: ()=>readEnv(\"NEXT_PUBLIC_WHOP_COMPANY_ID\"),\n    appUrl: ()=>readEnv(\"NEXT_PUBLIC_APP_URL\", \"\"),\n    whopLoginUrl: ()=>readEnv(\"NEXT_PUBLIC_WHOP_LOGIN_URL\", \"https://whop.com/login\"),\n    appwriteEndpoint: ()=>readEnv(\"APPWRITE_ENDPOINT\"),\n    appwriteProjectId: ()=>readEnv(\"APPWRITE_PROJECT_ID\"),\n    appwriteDatabaseId: ()=>readEnv(\"APPWRITE_DATABASE_ID\"),\n    appwriteUsersCollectionId: ()=>readEnv(\"APPWRITE_USERS_COLLECTION_ID\"),\n    appwritePostsCollectionId: ()=>readEnv(\"APPWRITE_POSTS_COLLECTION_ID\"),\n    appwriteAutomationsCollectionId: ()=>readEnv(\"APPWRITE_AUTOMATIONS_COLLECTION_ID\"),\n    appwriteLogsCollectionId: ()=>readEnv(\"APPWRITE_LOGS_COLLECTION_ID\"),\n    appwriteConnectionsCollectionId: ()=>readEnv(\"APPWRITE_CONNECTIONS_COLLECTION_ID\"),\n    appwriteYoutubeSubscriptionsCollectionId: ()=>readEnv(\"APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID\"),\n    appwriteApiKey: ()=>readEnv(\"APPWRITE_API_KEY\"),\n    appwriteMediaBucketId: ()=>readEnv(\"APPWRITE_MEDIA_BUCKET_ID\"),\n    appwritePostFunctionId: ()=>readEnv(\"APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID\"),\n    appwriteDistributeMessageFunctionId: ()=>readEnv(\"APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID\"),\n    appwriteSubscribeYoutubeFunctionId: ()=>readEnv(\"APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID\"),\n    appwriteAuthRedirectFunctionId: ()=>readEnv(\"APPWRITE_FUNCTION_AUTH_REDIRECT_ID\"),\n    youtubeClientId: ()=>readEnv(\"YOUTUBE_CLIENT_ID\"),\n    youtubeClientSecret: ()=>readEnv(\"YOUTUBE_CLIENT_SECRET\"),\n    youtubeRedirectUri: ()=>readEnv(\"YOUTUBE_REDIRECT_URI\"),\n    discordClientId: ()=>readEnv(\"DISCORD_CLIENT_ID\"),\n    discordClientSecret: ()=>readEnv(\"DISCORD_CLIENT_SECRET\"),\n    discordRedirectUri: ()=>readEnv(\"DISCORD_REDIRECT_URI\"),\n    whopClientId: ()=>readEnv(\"WHOP_CLIENT_ID\"),\n    whopClientSecret: ()=>readEnv(\"WHOP_CLIENT_SECRET\"),\n    whopRedirectUri: ()=>readEnv(\"WHOP_REDIRECT_URI\"),\n    instagramAccessToken: ()=>readEnv(\"INSTAGRAM_ACCESS_TOKEN\"),\n    instagramBusinessId: ()=>readEnv(\"INSTAGRAM_BUSINESS_ID\"),\n    defaultTimezone: ()=>readEnv(\"DEFAULT_TIMEZONE\", \"UTC\"),\n    whopProAccessPassId: ()=>readEnv(\"NEXT_PUBLIC_WHOP_PRO_ACCESS_PASS_ID\", \"\"),\n    whopEnterpriseAccessPassId: ()=>readEnv(\"NEXT_PUBLIC_WHOP_ENTERPRISE_ACCESS_PASS_ID\", \"\")\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZW52LnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFxQ0EsTUFBTUEsb0JBQThCO0lBQ25DO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNBO0FBRUQsTUFBTUMsV0FBVyxJQUFJQztBQUVyQixTQUFTQyxRQUFRQyxHQUFXLEVBQUVDLFFBQWlCO0lBQzlDLElBQUlKLFNBQVNLLEdBQUcsQ0FBQ0YsTUFBTTtRQUN0QixPQUFPSCxTQUFTTSxHQUFHLENBQUNIO0lBQ3JCO0lBRUEsTUFBTUksUUFBUUMsUUFBUUMsR0FBRyxDQUFDTixJQUFJLElBQUlDO0lBRWxDLElBQUksQ0FBQ0csU0FBU0EsTUFBTUcsTUFBTSxLQUFLLEdBQUc7UUFDakMsSUFBSVgsa0JBQWtCWSxRQUFRLENBQUNSLE1BQU07WUFDcEMsTUFBTSxJQUFJUyxNQUFNLENBQUMsdUNBQXVDLEVBQUVULEtBQUs7UUFDaEU7SUFDRDtJQUVBSCxTQUFTYSxHQUFHLENBQUNWLEtBQUtJLFNBQVM7SUFDM0IsT0FBT0EsU0FBUztBQUNqQjtBQUVPLE1BQU1FLE1BQU07SUFDbEJLLFlBQVksSUFBTVosUUFBUTtJQUMxQmEsV0FBVyxJQUFNYixRQUFRO0lBQ3pCYyxpQkFBaUIsSUFBTWQsUUFBUTtJQUMvQmUsZUFBZSxJQUFNZixRQUFRO0lBQzdCZ0IsUUFBUSxJQUFNaEIsUUFBUSx1QkFBdUI7SUFDN0NpQixjQUFjLElBQU1qQixRQUFRLDhCQUE4QjtJQUMxRGtCLGtCQUFrQixJQUFNbEIsUUFBUTtJQUNoQ21CLG1CQUFtQixJQUFNbkIsUUFBUTtJQUNqQ29CLG9CQUFvQixJQUFNcEIsUUFBUTtJQUNsQ3FCLDJCQUEyQixJQUFNckIsUUFBUTtJQUN6Q3NCLDJCQUEyQixJQUFNdEIsUUFBUTtJQUN6Q3VCLGlDQUFpQyxJQUNoQ3ZCLFFBQVE7SUFDVHdCLDBCQUEwQixJQUFNeEIsUUFBUTtJQUN4Q3lCLGlDQUFpQyxJQUFNekIsUUFBUTtJQUMvQzBCLDBDQUEwQyxJQUFNMUIsUUFBUTtJQUN4RDJCLGdCQUFnQixJQUFNM0IsUUFBUTtJQUM5QjRCLHVCQUF1QixJQUFNNUIsUUFBUTtJQUNyQzZCLHdCQUF3QixJQUFNN0IsUUFBUTtJQUN0QzhCLHFDQUFxQyxJQUFNOUIsUUFBUTtJQUNuRCtCLG9DQUFvQyxJQUFNL0IsUUFBUTtJQUNsRGdDLGdDQUFnQyxJQUFNaEMsUUFBUTtJQUM5Q2lDLGlCQUFpQixJQUFNakMsUUFBUTtJQUMvQmtDLHFCQUFxQixJQUFNbEMsUUFBUTtJQUNuQ21DLG9CQUFvQixJQUFNbkMsUUFBUTtJQUNsQ29DLGlCQUFpQixJQUFNcEMsUUFBUTtJQUMvQnFDLHFCQUFxQixJQUFNckMsUUFBUTtJQUNuQ3NDLG9CQUFvQixJQUFNdEMsUUFBUTtJQUNsQ3VDLGNBQWMsSUFBTXZDLFFBQVE7SUFDNUJ3QyxrQkFBa0IsSUFBTXhDLFFBQVE7SUFDaEN5QyxpQkFBaUIsSUFBTXpDLFFBQVE7SUFDL0IwQyxzQkFBc0IsSUFBTTFDLFFBQVE7SUFDcEMyQyxxQkFBcUIsSUFBTTNDLFFBQVE7SUFDbkM0QyxpQkFBaUIsSUFBTTVDLFFBQVEsb0JBQW9CO0lBQ25ENkMscUJBQXFCLElBQU03QyxRQUFRLHVDQUF1QztJQUMxRThDLDRCQUE0QixJQUFNOUMsUUFBUSw4Q0FBOEM7QUFDekYsRUFBRSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxhbWFuN1xcRGVza3RvcFxcQW1wRmxvd1xcbGliXFxlbnYudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBFbnZLZXkgPVxyXG5cdHwgXCJXSE9QX0FQSV9LRVlcIlxyXG5cdHwgXCJORVhUX1BVQkxJQ19XSE9QX0FQUF9JRFwiXHJcblx0fCBcIk5FWFRfUFVCTElDX1dIT1BfQUdFTlRfVVNFUl9JRFwiXHJcblx0fCBcIk5FWFRfUFVCTElDX1dIT1BfQ09NUEFOWV9JRFwiXHJcblx0fCBcIk5FWFRfUFVCTElDX0FQUF9VUkxcIlxyXG5cdHwgXCJORVhUX1BVQkxJQ19XSE9QX0xPR0lOX1VSTFwiXHJcblx0fCBcIkFQUFdSSVRFX0VORFBPSU5UXCJcclxuXHR8IFwiQVBQV1JJVEVfUFJPSkVDVF9JRFwiXHJcblx0fCBcIkFQUFdSSVRFX0RBVEFCQVNFX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfVVNFUlNfQ09MTEVDVElPTl9JRFwiXHJcblx0fCBcIkFQUFdSSVRFX1BPU1RTX0NPTExFQ1RJT05fSURcIlxyXG5cdHwgXCJBUFBXUklURV9BVVRPTUFUSU9OU19DT0xMRUNUSU9OX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfTE9HU19DT0xMRUNUSU9OX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfQ09OTkVDVElPTlNfQ09MTEVDVElPTl9JRFwiXHJcblx0fCBcIkFQUFdSSVRFX1lPVVRVQkVfU1VCU0NSSVBUSU9OU19DT0xMRUNUSU9OX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfQVBJX0tFWVwiXHJcblx0fCBcIkFQUFdSSVRFX01FRElBX0JVQ0tFVF9JRFwiXHJcblx0fCBcIkFQUFdSSVRFX0ZVTkNUSU9OX1BPU1RfVE9fSU5TVEFHUkFNX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfRlVOQ1RJT05fRElTVFJJQlVURV9NRVNTQUdFX0lEXCJcclxuXHR8IFwiQVBQV1JJVEVfRlVOQ1RJT05fU1VCU0NSSUJFX1lPVVRVQkVfSURcIlxyXG5cdHwgXCJBUFBXUklURV9GVU5DVElPTl9BVVRIX1JFRElSRUNUX0lEXCJcclxuXHR8IFwiWU9VVFVCRV9DTElFTlRfSURcIlxyXG5cdHwgXCJZT1VUVUJFX0NMSUVOVF9TRUNSRVRcIlxyXG5cdHwgXCJZT1VUVUJFX1JFRElSRUNUX1VSSVwiXHJcblx0fCBcIklOU1RBR1JBTV9BQ0NFU1NfVE9LRU5cIlxyXG5cdHwgXCJJTlNUQUdSQU1fQlVTSU5FU1NfSURcIlxyXG5cdHwgXCJESVNDT1JEX0NMSUVOVF9JRFwiXHJcblx0fCBcIkRJU0NPUkRfQ0xJRU5UX1NFQ1JFVFwiXHJcblx0fCBcIkRJU0NPUkRfUkVESVJFQ1RfVVJJXCJcclxuXHR8IFwiV0hPUF9DTElFTlRfSURcIlxyXG5cdHwgXCJXSE9QX0NMSUVOVF9TRUNSRVRcIlxyXG5cdHwgXCJXSE9QX1JFRElSRUNUX1VSSVwiXHJcblx0fCBcIkRFRkFVTFRfVElNRVpPTkVcIlxyXG5cdHwgXCJORVhUX1BVQkxJQ19XSE9QX1BST19BQ0NFU1NfUEFTU19JRFwiXHJcblx0fCBcIk5FWFRfUFVCTElDX1dIT1BfRU5URVJQUklTRV9BQ0NFU1NfUEFTU19JRFwiO1xyXG5cclxuY29uc3QgcmVxdWlyZWRTZXJ2ZXJFbnY6IEVudktleVtdID0gW1xyXG5cdFwiV0hPUF9BUElfS0VZXCIsXHJcblx0XCJORVhUX1BVQkxJQ19XSE9QX0FQUF9JRFwiLFxyXG5cdFwiTkVYVF9QVUJMSUNfV0hPUF9BR0VOVF9VU0VSX0lEXCIsXHJcblx0XCJORVhUX1BVQkxJQ19XSE9QX0NPTVBBTllfSURcIixcclxuXHRcIkFQUFdSSVRFX0VORFBPSU5UXCIsXHJcblx0XCJBUFBXUklURV9QUk9KRUNUX0lEXCIsXHJcblx0XCJBUFBXUklURV9EQVRBQkFTRV9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfVVNFUlNfQ09MTEVDVElPTl9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfUE9TVFNfQ09MTEVDVElPTl9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfQVVUT01BVElPTlNfQ09MTEVDVElPTl9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfTE9HU19DT0xMRUNUSU9OX0lEXCIsXHJcblx0XCJBUFBXUklURV9DT05ORUNUSU9OU19DT0xMRUNUSU9OX0lEXCIsXHJcblx0XCJBUFBXUklURV9ZT1VUVUJFX1NVQlNDUklQVElPTlNfQ09MTEVDVElPTl9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfQVBJX0tFWVwiLFxyXG5cdFwiQVBQV1JJVEVfTUVESUFfQlVDS0VUX0lEXCIsXHJcblx0XCJBUFBXUklURV9GVU5DVElPTl9QT1NUX1RPX0lOU1RBR1JBTV9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfRlVOQ1RJT05fRElTVFJJQlVURV9NRVNTQUdFX0lEXCIsXHJcblx0XCJBUFBXUklURV9GVU5DVElPTl9TVUJTQ1JJQkVfWU9VVFVCRV9JRFwiLFxyXG5cdFwiQVBQV1JJVEVfRlVOQ1RJT05fQVVUSF9SRURJUkVDVF9JRFwiLFxyXG5cdFwiWU9VVFVCRV9DTElFTlRfSURcIixcclxuXHRcIllPVVRVQkVfQ0xJRU5UX1NFQ1JFVFwiLFxyXG5cdFwiWU9VVFVCRV9SRURJUkVDVF9VUklcIixcclxuXHRcIklOU1RBR1JBTV9BQ0NFU1NfVE9LRU5cIixcclxuXHRcIklOU1RBR1JBTV9CVVNJTkVTU19JRFwiLFxyXG5cdFwiRElTQ09SRF9DTElFTlRfSURcIixcclxuXHRcIkRJU0NPUkRfQ0xJRU5UX1NFQ1JFVFwiLFxyXG5cdFwiRElTQ09SRF9SRURJUkVDVF9VUklcIixcclxuXHRcIldIT1BfQ0xJRU5UX0lEXCIsXHJcblx0XCJXSE9QX0NMSUVOVF9TRUNSRVRcIixcclxuXHRcIldIT1BfUkVESVJFQ1RfVVJJXCIsXHJcbl07XHJcblxyXG5jb25zdCBlbnZDYWNoZSA9IG5ldyBNYXA8RW52S2V5LCBzdHJpbmc+KCk7XHJcblxyXG5mdW5jdGlvbiByZWFkRW52KGtleTogRW52S2V5LCBmYWxsYmFjaz86IHN0cmluZyk6IHN0cmluZyB7XHJcblx0aWYgKGVudkNhY2hlLmhhcyhrZXkpKSB7XHJcblx0XHRyZXR1cm4gZW52Q2FjaGUuZ2V0KGtleSkgYXMgc3RyaW5nO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgdmFsdWUgPSBwcm9jZXNzLmVudltrZXldID8/IGZhbGxiYWNrO1xyXG5cclxuXHRpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0aWYgKHJlcXVpcmVkU2VydmVyRW52LmluY2x1ZGVzKGtleSkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIHJlcXVpcmVkIGVudmlyb25tZW50IHZhcmlhYmxlOiAke2tleX1gKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGVudkNhY2hlLnNldChrZXksIHZhbHVlID8/IFwiXCIpO1xyXG5cdHJldHVybiB2YWx1ZSA/PyBcIlwiO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZW52ID0ge1xyXG5cdHdob3BBcGlLZXk6ICgpID0+IHJlYWRFbnYoXCJXSE9QX0FQSV9LRVlcIiksXHJcblx0d2hvcEFwcElkOiAoKSA9PiByZWFkRW52KFwiTkVYVF9QVUJMSUNfV0hPUF9BUFBfSURcIiksXHJcblx0d2hvcEFnZW50VXNlcklkOiAoKSA9PiByZWFkRW52KFwiTkVYVF9QVUJMSUNfV0hPUF9BR0VOVF9VU0VSX0lEXCIpLFxyXG5cdHdob3BDb21wYW55SWQ6ICgpID0+IHJlYWRFbnYoXCJORVhUX1BVQkxJQ19XSE9QX0NPTVBBTllfSURcIiksXHJcblx0YXBwVXJsOiAoKSA9PiByZWFkRW52KFwiTkVYVF9QVUJMSUNfQVBQX1VSTFwiLCBcIlwiKSxcclxuXHR3aG9wTG9naW5Vcmw6ICgpID0+IHJlYWRFbnYoXCJORVhUX1BVQkxJQ19XSE9QX0xPR0lOX1VSTFwiLCBcImh0dHBzOi8vd2hvcC5jb20vbG9naW5cIiksXHJcblx0YXBwd3JpdGVFbmRwb2ludDogKCkgPT4gcmVhZEVudihcIkFQUFdSSVRFX0VORFBPSU5UXCIpLFxyXG5cdGFwcHdyaXRlUHJvamVjdElkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfUFJPSkVDVF9JRFwiKSxcclxuXHRhcHB3cml0ZURhdGFiYXNlSWQ6ICgpID0+IHJlYWRFbnYoXCJBUFBXUklURV9EQVRBQkFTRV9JRFwiKSxcclxuXHRhcHB3cml0ZVVzZXJzQ29sbGVjdGlvbklkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfVVNFUlNfQ09MTEVDVElPTl9JRFwiKSxcclxuXHRhcHB3cml0ZVBvc3RzQ29sbGVjdGlvbklkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfUE9TVFNfQ09MTEVDVElPTl9JRFwiKSxcclxuXHRhcHB3cml0ZUF1dG9tYXRpb25zQ29sbGVjdGlvbklkOiAoKSA9PlxyXG5cdFx0cmVhZEVudihcIkFQUFdSSVRFX0FVVE9NQVRJT05TX0NPTExFQ1RJT05fSURcIiksXHJcblx0YXBwd3JpdGVMb2dzQ29sbGVjdGlvbklkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfTE9HU19DT0xMRUNUSU9OX0lEXCIpLFxyXG5cdGFwcHdyaXRlQ29ubmVjdGlvbnNDb2xsZWN0aW9uSWQ6ICgpID0+IHJlYWRFbnYoXCJBUFBXUklURV9DT05ORUNUSU9OU19DT0xMRUNUSU9OX0lEXCIpLFxyXG5cdGFwcHdyaXRlWW91dHViZVN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uSWQ6ICgpID0+IHJlYWRFbnYoXCJBUFBXUklURV9ZT1VUVUJFX1NVQlNDUklQVElPTlNfQ09MTEVDVElPTl9JRFwiKSxcclxuXHRhcHB3cml0ZUFwaUtleTogKCkgPT4gcmVhZEVudihcIkFQUFdSSVRFX0FQSV9LRVlcIiksXHJcblx0YXBwd3JpdGVNZWRpYUJ1Y2tldElkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfTUVESUFfQlVDS0VUX0lEXCIpLFxyXG5cdGFwcHdyaXRlUG9zdEZ1bmN0aW9uSWQ6ICgpID0+IHJlYWRFbnYoXCJBUFBXUklURV9GVU5DVElPTl9QT1NUX1RPX0lOU1RBR1JBTV9JRFwiKSxcclxuXHRhcHB3cml0ZURpc3RyaWJ1dGVNZXNzYWdlRnVuY3Rpb25JZDogKCkgPT4gcmVhZEVudihcIkFQUFdSSVRFX0ZVTkNUSU9OX0RJU1RSSUJVVEVfTUVTU0FHRV9JRFwiKSxcclxuXHRhcHB3cml0ZVN1YnNjcmliZVlvdXR1YmVGdW5jdGlvbklkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfRlVOQ1RJT05fU1VCU0NSSUJFX1lPVVRVQkVfSURcIiksXHJcblx0YXBwd3JpdGVBdXRoUmVkaXJlY3RGdW5jdGlvbklkOiAoKSA9PiByZWFkRW52KFwiQVBQV1JJVEVfRlVOQ1RJT05fQVVUSF9SRURJUkVDVF9JRFwiKSxcclxuXHR5b3V0dWJlQ2xpZW50SWQ6ICgpID0+IHJlYWRFbnYoXCJZT1VUVUJFX0NMSUVOVF9JRFwiKSxcclxuXHR5b3V0dWJlQ2xpZW50U2VjcmV0OiAoKSA9PiByZWFkRW52KFwiWU9VVFVCRV9DTElFTlRfU0VDUkVUXCIpLFxyXG5cdHlvdXR1YmVSZWRpcmVjdFVyaTogKCkgPT4gcmVhZEVudihcIllPVVRVQkVfUkVESVJFQ1RfVVJJXCIpLFxyXG5cdGRpc2NvcmRDbGllbnRJZDogKCkgPT4gcmVhZEVudihcIkRJU0NPUkRfQ0xJRU5UX0lEXCIpLFxyXG5cdGRpc2NvcmRDbGllbnRTZWNyZXQ6ICgpID0+IHJlYWRFbnYoXCJESVNDT1JEX0NMSUVOVF9TRUNSRVRcIiksXHJcblx0ZGlzY29yZFJlZGlyZWN0VXJpOiAoKSA9PiByZWFkRW52KFwiRElTQ09SRF9SRURJUkVDVF9VUklcIiksXHJcblx0d2hvcENsaWVudElkOiAoKSA9PiByZWFkRW52KFwiV0hPUF9DTElFTlRfSURcIiksXHJcblx0d2hvcENsaWVudFNlY3JldDogKCkgPT4gcmVhZEVudihcIldIT1BfQ0xJRU5UX1NFQ1JFVFwiKSxcclxuXHR3aG9wUmVkaXJlY3RVcmk6ICgpID0+IHJlYWRFbnYoXCJXSE9QX1JFRElSRUNUX1VSSVwiKSxcclxuXHRpbnN0YWdyYW1BY2Nlc3NUb2tlbjogKCkgPT4gcmVhZEVudihcIklOU1RBR1JBTV9BQ0NFU1NfVE9LRU5cIiksXHJcblx0aW5zdGFncmFtQnVzaW5lc3NJZDogKCkgPT4gcmVhZEVudihcIklOU1RBR1JBTV9CVVNJTkVTU19JRFwiKSxcclxuXHRkZWZhdWx0VGltZXpvbmU6ICgpID0+IHJlYWRFbnYoXCJERUZBVUxUX1RJTUVaT05FXCIsIFwiVVRDXCIpLFxyXG5cdHdob3BQcm9BY2Nlc3NQYXNzSWQ6ICgpID0+IHJlYWRFbnYoXCJORVhUX1BVQkxJQ19XSE9QX1BST19BQ0NFU1NfUEFTU19JRFwiLCBcIlwiKSxcclxuXHR3aG9wRW50ZXJwcmlzZUFjY2Vzc1Bhc3NJZDogKCkgPT4gcmVhZEVudihcIk5FWFRfUFVCTElDX1dIT1BfRU5URVJQUklTRV9BQ0NFU1NfUEFTU19JRFwiLCBcIlwiKSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEVudiA9IHR5cGVvZiBlbnY7XHJcbiJdLCJuYW1lcyI6WyJyZXF1aXJlZFNlcnZlckVudiIsImVudkNhY2hlIiwiTWFwIiwicmVhZEVudiIsImtleSIsImZhbGxiYWNrIiwiaGFzIiwiZ2V0IiwidmFsdWUiLCJwcm9jZXNzIiwiZW52IiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJFcnJvciIsInNldCIsIndob3BBcGlLZXkiLCJ3aG9wQXBwSWQiLCJ3aG9wQWdlbnRVc2VySWQiLCJ3aG9wQ29tcGFueUlkIiwiYXBwVXJsIiwid2hvcExvZ2luVXJsIiwiYXBwd3JpdGVFbmRwb2ludCIsImFwcHdyaXRlUHJvamVjdElkIiwiYXBwd3JpdGVEYXRhYmFzZUlkIiwiYXBwd3JpdGVVc2Vyc0NvbGxlY3Rpb25JZCIsImFwcHdyaXRlUG9zdHNDb2xsZWN0aW9uSWQiLCJhcHB3cml0ZUF1dG9tYXRpb25zQ29sbGVjdGlvbklkIiwiYXBwd3JpdGVMb2dzQ29sbGVjdGlvbklkIiwiYXBwd3JpdGVDb25uZWN0aW9uc0NvbGxlY3Rpb25JZCIsImFwcHdyaXRlWW91dHViZVN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uSWQiLCJhcHB3cml0ZUFwaUtleSIsImFwcHdyaXRlTWVkaWFCdWNrZXRJZCIsImFwcHdyaXRlUG9zdEZ1bmN0aW9uSWQiLCJhcHB3cml0ZURpc3RyaWJ1dGVNZXNzYWdlRnVuY3Rpb25JZCIsImFwcHdyaXRlU3Vic2NyaWJlWW91dHViZUZ1bmN0aW9uSWQiLCJhcHB3cml0ZUF1dGhSZWRpcmVjdEZ1bmN0aW9uSWQiLCJ5b3V0dWJlQ2xpZW50SWQiLCJ5b3V0dWJlQ2xpZW50U2VjcmV0IiwieW91dHViZVJlZGlyZWN0VXJpIiwiZGlzY29yZENsaWVudElkIiwiZGlzY29yZENsaWVudFNlY3JldCIsImRpc2NvcmRSZWRpcmVjdFVyaSIsIndob3BDbGllbnRJZCIsIndob3BDbGllbnRTZWNyZXQiLCJ3aG9wUmVkaXJlY3RVcmkiLCJpbnN0YWdyYW1BY2Nlc3NUb2tlbiIsImluc3RhZ3JhbUJ1c2luZXNzSWQiLCJkZWZhdWx0VGltZXpvbmUiLCJ3aG9wUHJvQWNjZXNzUGFzc0lkIiwid2hvcEVudGVycHJpc2VBY2Nlc3NQYXNzSWQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/env.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/@opentelemetry/instrumentation/build/esm/platform/node sync recursive":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/ sync ***!
  \***********************************************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "(rsc)/./node_modules/@opentelemetry/instrumentation/build/esm/platform/node sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "(rsc)/./node_modules/@prisma/instrumentation/node_modules/@opentelemetry/instrumentation/build/esm/platform/node sync recursive":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@prisma/instrumentation/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/ sync ***!
  \************************************************************************************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "(rsc)/./node_modules/@prisma/instrumentation/node_modules/@opentelemetry/instrumentation/build/esm/platform/node sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fwhop%2Froute&page=%2Fapi%2Fauth%2Fwhop%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fwhop%2Froute.ts&appDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fwhop%2Froute&page=%2Fapi%2Fauth%2Fwhop%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fwhop%2Froute.ts&appDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_aman7_Desktop_AmpFlow_app_api_auth_whop_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/whop/route.ts */ \"(rsc)/./app/api/auth/whop/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/whop/route\",\n        pathname: \"/api/auth/whop\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/whop/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\aman7\\\\Desktop\\\\AmpFlow\\\\app\\\\api\\\\auth\\\\whop\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_aman7_Desktop_AmpFlow_app_api_auth_whop_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGd2hvcCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXV0aCUyRndob3AlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGd2hvcCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNhbWFuNyU1Q0Rlc2t0b3AlNUNBbXBGbG93JTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNhbWFuNyU1Q0Rlc2t0b3AlNUNBbXBGbG93JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNrQjtBQUMvRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcYW1hbjdcXFxcRGVza3RvcFxcXFxBbXBGbG93XFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFx3aG9wXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL3dob3Avcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL3dob3BcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvd2hvcC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGFtYW43XFxcXERlc2t0b3BcXFxcQW1wRmxvd1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcd2hvcFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fwhop%2Froute&page=%2Fapi%2Fauth%2Fwhop%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fwhop%2Froute.ts&appDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "async_hooks":
/*!******************************!*\
  !*** external "async_hooks" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("async_hooks");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "diagnostics_channel":
/*!**************************************!*\
  !*** external "diagnostics_channel" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("diagnostics_channel");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "import-in-the-middle":
/*!***************************************!*\
  !*** external "import-in-the-middle" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("import-in-the-middle");

/***/ }),

/***/ "module":
/*!*************************!*\
  !*** external "module" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("module");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:child_process":
/*!*************************************!*\
  !*** external "node:child_process" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:child_process");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:https");

/***/ }),

/***/ "node:inspector":
/*!*********************************!*\
  !*** external "node:inspector" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:inspector");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:os");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:readline":
/*!********************************!*\
  !*** external "node:readline" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:readline");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:tls");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "perf_hooks":
/*!*****************************!*\
  !*** external "perf_hooks" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("perf_hooks");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ "require-in-the-middle":
/*!****************************************!*\
  !*** external "require-in-the-middle" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("require-in-the-middle");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@opentelemetry","vendor-chunks/next","vendor-chunks/@sentry","vendor-chunks/@prisma","vendor-chunks/semver","vendor-chunks/color-convert","vendor-chunks/is-core-module","vendor-chunks/forwarded-parse","vendor-chunks/color-name","vendor-chunks/ansi-styles","vendor-chunks/stacktrace-parser","vendor-chunks/shimmer","vendor-chunks/supports-color","vendor-chunks/function-bind","vendor-chunks/path-parse","vendor-chunks/balanced-match","vendor-chunks/has-flag","vendor-chunks/hasown"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fwhop%2Froute&page=%2Fapi%2Fauth%2Fwhop%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fwhop%2Froute.ts&appDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Caman7%5CDesktop%5CAmpFlow&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();