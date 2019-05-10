import "allocator/arena";

// ewasm imports
@external("ethereum", "finish")
declare function ethereum_finish(dataOffset: i32, length: i32): void;
@external("ethereum", "revert")
declare function ethereum_revert(dataOffset: i32, length: i32): void;
@external("ethereum", "callDataCopy")
declare function ethereum_callDataCopy(resultOffset: i32, dataOffset: i32, length: i32): void;
@external("ethereum", "getCallDataSize")
declare function ethereum_getCallDataSize(): i32;
@external("ethereum", "getCaller")
declare function ethereum_getCaller(dataOffset: i32): void;
@external("ethereum", "storageStore")
declare function ethereum_storageStore(pathOffset: i32, valueOffset: i32): void;
@external("ethereum", "storageLoad")
declare function ethereum_storageLoad(pathOffset: i32, resultOffset: i32): void;

export function main(): void {
    // assume the memory is already expanded..
    // ethereum_return(0, ethereum_callDataSize())

    // Make sure we have enough args
  if (ethereum_getCallDataSize() < 4)
    ethereum_revert(0, 0);

  var ptrSelector : i32 = memory.allocate(4);
  ethereum_callDataCopy(ptrSelector, 0, 4);
  var selector : i32 = load<i32>(ptrSelector);
    switch(selector) {
    case 0xbd9f355d:
        do_transfer();
        break;
    case 0x1a029399:
        do_balance();
        break;
    default:
        ethereum_revert(0, 0);
        //ethereum_finish(ptrSelector, 4);
    }
}

// do_balance
function do_balance(): void {
  if (ethereum_getCallDataSize() !== 24)
    ethereum_revert(0, 0);

    var ptrStorageKey : i32 = memory.allocate(32);
    var ptrAddress : i32 = ptrStorageKey + 12;
    ethereum_callDataCopy(ptrAddress, 4, 20);
    var ptrBalance : i32 = memory.allocate(32);
    ethereum_storageLoad(ptrStorageKey, ptrBalance);
    ethereum_finish(ptrBalance, 32);
}


// do_transfer
function do_transfer(): void {
    if (ethereum_getCallDataSize() !== 32)
        ethereum_revert(0, 0);

    // successfully returned
    var senderKey : i32 = memory.allocate(32);
    var ptrSender : i32 = senderKey + 12;
    ethereum_getCaller(ptrSender);

    // successfully returned
    var recipientKey : i32 = memory.allocate(32);
    var ptrRecipient : i32 = recipientKey + 12;
    ethereum_callDataCopy(ptrRecipient, 4, 20);

    // successfully returned
    var ptrValue32 : i32 = memory.allocate(32);
    var ptrValue8 : i32 = ptrValue32 + 24;
    ethereum_callDataCopy(ptrValue8, 24, 8);1

    // successfully returned
    var ptrSenderBalance = memory.allocate(32);

    // successfully returned?
    var ptrRecipientBalance = memory.allocate(32);
    
    ethereum_storageLoad(senderKey, ptrSenderBalance);
    ethereum_storageLoad(recipientKey, ptrRecipientBalance);

    // 
    var senderBalance = load<i32>(ptrSenderBalance+28);
    var recipientBalance = load<i32>(ptrRecipientBalance+28);
    var value = load<i32>(ptrValue32+28);
  
    if (senderBalance < value)
        ethereum_revert(0, 0);

    //var finalBalance = senderBalance - value;
    var finalBalance = senderBalance - value;
    var ptrFinalBalance = memory.allocate(32);
    store<i32>(ptrFinalBalance+28, finalBalance);

    store<i32>(ptrRecipientBalance, recipientBalance + value);
    ethereum_storageStore(senderKey, ptrSenderBalance);
    ethereum_storageStore(recipientKey, ptrRecipientBalance);

    ethereum_finish(ptrFinalBalance, 32);
    //ethereum_finish(ptrSenderBalance, 32);
}



