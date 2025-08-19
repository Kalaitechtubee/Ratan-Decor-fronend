# Debugging Guide for Ratan Decor

## React DevTools Installation

React DevTools is an essential browser extension for debugging React applications. It allows you to inspect React components, edit props and state, and identify performance issues.

### Browser Extensions

The easiest way to use React DevTools is to install the browser extension:

- [Install for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- [Install for Edge](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

After installation, you'll see the Components and Profiler panels in your browser's developer tools when visiting a React website. These panels will appear in the DevTools alongside Elements, Console, Network, etc.

### For Safari or Other Browsers

For Safari or other browsers, install the standalone version:

```bash
# Using npm
npm install -g react-devtools

# Using yarn
yarn global add react-devtools
```

Then open the DevTools from the terminal:

```bash
react-devtools
```

Add this script tag to the beginning of your app's `<head>` section:

```html
<script src="http://localhost:8097"></script>
```

## Common Network Issues and Solutions

### Backend Connection Issues

If you're experiencing network errors when trying to connect to the backend:

1. **Ensure the backend server is running**
   - Check that your backend server is started and running on the correct port (default: 3000)

2. **Check for CORS issues**
   - The application now uses a Vite proxy configuration to avoid CORS issues during development
   - If you see CORS errors in the console ("Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy"), try these solutions:
     - Verify the proxy settings in `vite.config.js` are correct and match your backend URL
     - Make sure the proxy rewrite rule is properly configured to remove the `/api` prefix
     - Restart the Vite development server after any configuration changes
     - Clear browser cache and cookies, or try in an incognito/private window
     - If using a custom backend, ensure it has proper CORS headers:
       ```javascript
       // Example Express.js CORS configuration
       app.use(cors({
         origin: 'http://localhost:5173', // Your frontend URL
         credentials: true
       }));
       ```
   - The updated proxy configuration in `vite.config.js` should handle most CORS issues automatically during development

3. **Verify API endpoints**
   - Confirm that the API endpoints match what the backend expects
   - Check the API base URL in the `.env` file

### Network Debugging Tips

1. **Use the Network tab in DevTools**
   - Monitor requests and responses in the browser's Network tab
   - Look for failed requests (red) and check their details

2. **Check console for errors**
   - The application logs detailed error information to the console
   - Look for messages with 🚫 [API] Error prefix

3. **Test API endpoints directly**
   - Use tools like Postman or curl to test API endpoints directly
   - This helps determine if issues are in the frontend or backend

## Application Improvements

Recent improvements to handle network issues:

1. **Request retry mechanism**
   - The application now automatically retries failed network requests
   - Uses exponential backoff to avoid overwhelming the server

2. **Server availability check**
   - Before login attempts, the app checks if the backend server is available
   - Provides clear error messages when the server is unreachable

3. **Improved error handling**
   - More descriptive error messages for common network issues
   - Better console logging for debugging

4. **Vite proxy configuration**
   - Added proxy configuration to avoid CORS issues during development