function testLN01() {
    const d = new Date();
    document.getElementById("webln").innerHTML = d.toLocaleTimeString();
};

// const webln = require('webln');
//const requestProvider = WebLN.requestProvider();
// import { requestProvider } from 'webln';

async function asyncLN02(req, res) {
    document.getElementById("getpubkey").innerText = "Processing";

    var msg = "Starting...";
    document.getElementById("webln").innerHTML = msg;

    doLog(msg);
    try {
        const webln = await WebLN.requestProvider();
        msg = "Got reqProv..."; document.getElementById("webln").innerHTML = msg; doLog(msg);
        const info = await webln.getInfo();
        console.log("Info.alias: " + info.node.alias);
        console.log("Info.color: " + info.node.color);
        console.log("Info.pubkey: " + info.node.pubkey);
        msg = "Got Infov..."; document.getElementById("webln").innerHTML = msg; doLog(msg);
        doLog(JSON.stringify(info.node));
        document.getElementById("lnpub").value = info.node.pubkey;
        document.getElementById("nick").value = info.node.alias;
        document.getElementById("getpubkey").innerText = "Complete";
        document.getElementById("getnick").innerHTML = "Check Availability";
    }
    catch(err) {
        // Tell the user what went wrong
        console.log(err.message);
        alert(err.message);
        doLog(err.message);
    }
};

function testLN02() {
    document.getElementById("webln").innerHTML = "TestLN02";
    asyncLN02(null, null);
};

async function asyncLN03(req, res) {
    document.getElementById("webln").innerHTML = "Starting...";
    try {
        const webln = await WebLN.requestProvider();
        document.getElementById("webln").innerHTML = "Got reqProv...";
        let nick = document.querySelector("#nick").value;
        const invoice = await webln.makeInvoice({"amount":17, "defaultMemo":"Test Invoice from " + nick});
        console.log("Invoice: " + invoice.paymentRequest);
        document.getElementById("webln").innerHTML = "Make Invoice.";
        connection.send(nick + ":INV:" + invoice.paymentRequest);
        document.getElementById("webln").innerHTML = "Sent Invoice.";
      }
      catch(err) {
        // Tell the user what went wrong
        console.log(err.message);
    }
};

function testLN03() {
    document.getElementById("webln").innerHTML = "TestLN03";
    asyncLN03(null, null);
};

async function asyncLN04(req, res) {
    document.getElementById("webln").innerHTML = "Starting...";
    try {
        const webln = await WebLN.requestProvider();
        document.getElementById("webln").innerHTML = "Got reqProv...";
        // let nick = document.querySelector("#nick").value;
        // let invoice = document.getElementById("invoice").innerHTML;
        let invoice = document.querySelector("#invoice").value;
        if (invoice.length > 0) {
            document.getElementById("webln").innerHTML = "Send Payment.";
            const preimage = await webln.sendPayment(invoice);
            console.log("PreImage: " + preimage);
        } else {
            document.getElementById("webln").innerHTML = "No Invoice Yet.";
        }
      }
      catch(err) {
        // Tell the user what went wrong
        console.log(err.message);
        document.getElementById("webln").innerHTML = err.message;
    }
};

function testLN04() {
    document.getElementById("webln").innerHTML = "TestLN04";
    asyncLN04(null, null);
};

async function asyncLN05(req, res) {
    document.getElementById("webln").innerHTML = "Starting...";
    try {
        const webln = await WebLN.requestProvider();
        document.getElementById("webln").innerHTML = "Got reqProv...";
        let message = document.querySelector("#message").value;
        if (message.length > 0) {
            document.getElementById("webln").innerHTML = "Sign Message.";
            const response = await webln.signMessage(message);
            let invoice = document.querySelector("#invoice");
            invoice.value = response.signature;
            console.log("Message: " + response.message);
            console.log("Signature: " + response.signature);
        } else {
            document.getElementById("webln").innerHTML = "No Message.";
        }
      }
      catch(err) {
        // Tell the user what went wrong
        console.log(err.message);
        document.getElementById("webln").innerHTML = err.message;
    }
};

function testLN05() {
    document.getElementById("webln").innerHTML = "TestLN05";
    asyncLN05(null, null);
};

async function asyncLN06(req, res) {
    document.getElementById("webln").innerHTML = "Starting...";
    try {
        const webln = await WebLN.requestProvider();
        document.getElementById("webln").innerHTML = "Got reqProv...";
        let message = document.querySelector("#message");
        let invoice = document.querySelector("#invoice");
        if ((message.value.length > 0) && (invoice.value.length > 0)) {
            document.getElementById("webln").innerHTML = "Verify Message.";
            const response = await webln.verifyMessage(invoice.value, message.value);
            if (response.valid) {
                console.log("Verified!");
                message.value = message.value + " <= Verified!";
            } else {
                document.getElementById("webln").innerHTML = "Not Verified!";
                console.log("Not Verified!");
                message.value = message.value + " <= NOT!";
            }
        } else {
            document.getElementById("webln").innerHTML = "No Message and/or Signature.";
        }
      }
      catch(err) {
        // Tell the user what went wrong
        console.log(err.message);
        document.getElementById("webln").innerHTML = err.message;
    }
};

function testLN06() {
    document.getElementById("webln").innerHTML = "TestLN06";
    asyncLN06(null, null);
};