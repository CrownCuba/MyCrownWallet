if (networkEnabled) {
  var getBlockCount = function() {
    var request = new XMLHttpRequest();
    
    request.open('GET', "http://92.60.44.28:8080/blockcount", true);  
    request.onerror = function () {
      createAlert("warning", "The api is down");
      networkEnabled = false;
      document.getElementById('Network').innerHTML = "";
    }
    request.onload = function () {
      const data = Number(this.response);
      // If the block count has changed, refresh all of our data!
      domBalanceReload.className = domBalanceReload.className.replace(/ playAnim/g, "");
      //domBalanceReloadStaking.className = domBalanceReloadStaking.className.replace(/ playAnim/g, "");
      if (data > cachedBlockCount) {
        console.log("New block detected! " + cachedBlockCount + " --> " + data);
        if (publicKeyForNetwork)
          getUnspentTransactions();
      }
      cachedBlockCount = data;
    }
    request.send();
    console.log(request.response)
  }

  var getUnspentTransactions = function () {
    var request = new XMLHttpRequest()
    console.log(publicKeyForNetwork);
    request.open('GET', "http://92.60.44.28:8080/utxo/" + publicKeyForNetwork, true)
    request.onload = function () {
      const data = JSON.parse(this.response);
      cachedUTXOs = [];
      if (!data.unspent_outputs || data.unspent_outputs.length === 0) {
        console.log('No unspent Transactions');
        document.getElementById("errorNotice").innerHTML = '<div class="alert alert-danger" role="alert"><h4>Note:</h4><h5>You don\'t have any funds, get some coins first!</h5></div>';
      } else {
        document.getElementById("errorNotice").innerHTML = '';
        // Standardize the API UTXOs into a simplified MPW format
        data.unspent_outputs.map(cUTXO => cachedUTXOs.push({
          'id': cUTXO.tx_hash,
          'vout': cUTXO.tx_ouput_n,
          'sats': cUTXO.value,
          'script': cUTXO.script
        }));
        // Update the GUI with the newly cached UTXO set
        console.log(getBalance(true));
        
      }
    }
    request.send();
  }

  var sendTransaction = function (hex, msg = '') {
    var request = new XMLHttpRequest();
    console.log(hex)
    request.open('GET', 'http://92.60.44.28:8080/sendtx/' + hex, true)
    request.onerror = function () {
      createAlert("warning", "stakecube api is down");
      networkEnabled = false;
      document.getElementById('Network').innerHTML = "";
    }
    request.onload = function () {
      const data = this.response;
      if (data.length === 64) {
        console.log('Transaction sent! ' + data);
        if (domAddress1s.value !== donationAddress)
          document.getElementById("transactionFinal").innerHTML = ('<h4 style="color:green">Transaction sent! ' + data + '</h4>');
        else
          document.getElementById("transactionFinal").innerHTML = ('<h4 style="color:green">Thank you for supporting MyPIVXWallet! 💜💜💜<br>' + data + '</h4>');
        domSimpleTXs.style.display = 'none';
        domAddress1s.value = '';
        domValue1s.innerHTML = '';
        if (msg) alert(msg);
      } else {
        console.log('Error sending transaction: ' + data);
        document.getElementById("transactionFinal").innerHTML = ('<h4 style="color:red">Error sending transaction: ' + data + "</h4>");
      }
    }
    request.send();
  }

  var calculatefee = function (bytes) {
    // TEMPORARY: Hardcoded fee per-byte
    return (bytes * 200) / COIN; // 200 sat/byte
  }

  document.getElementById('Network').innerHTML = "<b> Network:</b> Enabled";
}