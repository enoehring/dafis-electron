/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

console.log('👋 This message is being logged by "renderer.js", included via webpack');

import './scss/app.scss'; // just change this line here.
import 'bootstrap';
import '@microsoft/signalr';
import 'moment';
import "@fortawesome/fontawesome-free/js/all";
import '../assets/jquery-ui.min.js';
import '../node_modules/moment/dist/moment.js';
import './js/framework/particles.min.js';
import './js/framework/datatables-keyTable/dataTables.keyTable.min.js';
import './js/framework/datatables-colreorder/dataTables.colReorder.min.js';
import './js/framework/datatables-scroller/dataTables.scroller.min.js';
import 'leader-line-new';
import './js/framework/datetime-moment.js';
import './js/helper.js';
import './js/data.js';
import './js/index.js';
import './js/upload.js';
import './scss/custom.scss';
import './scss/summer.scss';
import './scss/fancy.scss';
import './scss/initial.scss';