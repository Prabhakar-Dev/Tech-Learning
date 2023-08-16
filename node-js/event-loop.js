/**
 * EVENT LOOP
 * 
 * ----------------
 * Introduction
 * ----------------
 * Event loop is a endless and indefinite loop. It is responsible for execute code, collecting events and execute event of event queue.
 * Event Loop uses single thread only. It is main heart of Node JS Platform Processing Model.
 * 
 * ----------------
 * How it works
 * ----------------
 * 1. Client send request to Node Web Server.
 * 2. Node Web Server recieves those requests and place them into Event Queue.
 * 3. Even Loop checks any Client Request is placed in Event Queue. If no, then wait for incoming requests for indefinitely.
 * 4. If yes, then pick up one Client Request from Event Queue
 *      1. Starts process that Client Request
 *      2. If that Client Request Does Not requires any Blocking IO Operations, then process everything, prepare response and send it back to client.
 *      3. If that Client Request requires some Blocking IO Operations like interacting with Database, File System, External Services then checks threads availability from Internal Thread Pool.
 *      4. Picks up one Thread and assign this Client Request to that thread. That Thread is responsible for taking that request, process it, perform Blocking IO operations, prepare response and send it back to the Event Loop
 *      5. Event Loop sends that Response to the respective Client.
 * 
 */


console.log("This is the first statement");
  
setTimeout(function(){
    console.log("This is the second statement");
}, 1000);
  
console.log("This is the third statement");