import arg from 'arg';
import inquirer from 'inquirer';
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import Eth from "@ledgerhq/hw-app-eth";
import Web3 from 'web3';
import {encode} from 'rlp';
import {sha256} from 'js-sha256';

const web3 = new Web3("https://rpc.apothem.network");

function parseArgumentIntoOption(rawArgs) {
    const args = arg(
        {
            '--publicKey': Boolean,
            '--signMessage': Boolean,
            '--signTx': Boolean,
            '--getVersion': Boolean,
            '--help': Boolean,
            '-p': '--publicKey',
            '-m': '--signMessage',
            '-t': '--signTx',
            '-v': '--getVersion',
            '-h': '--help'
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        publicKey: args['--publicKey'] || false,
        signMessage: args['--signMessage'] || false,
        signTx: args['--signTx'] || false,
        getVersion: args['--getVersion'] || false,
        help: args['--help'] || !(args['--publicKey'] || args['--signMessage'] || args['--signTx'] || args['--getVersion']) || false
    };
}

async function getPublicKey() {

    try {
        const question = [
            {
                name: 'index',
                type: 'number',
                message: 'Please enter index',
                default: 0
            }
        ];
        const answers = await inquirer.prompt(question)
        let transport = await TransportNodeHid.open("");

        const eth = new Eth(transport)

        let result = await eth.getAddress(`44'/550'/0/0/${answers.index}`, 0, 1);
        result.address = "xdc" + result.address.slice(2)
        console.log(result)
        await eth.getAddress(`44'/550'/0/0/${answers.index}`, 1, 1);
    }
    catch (error) {
        console.log(error)
    }
}

async function getVersion() {

    try {
        let transport = await TransportNodeHid.open("");
        let eth = new Eth(transport);
        let result = await eth.getAppConfiguration();
        console.log("BOLOS App Version : ", result.version)
    }
    catch (error) {
        console.log(error)
    }
}

async function signMessage() {

    try {

        const questions = [
            {
                name: 'index',
                type: 'number',
                message: 'Please enter index of public key',
                default: 0
            },
            {
                name: 'message',
                type: 'string',
                message: 'Enter Message to be signed',
            }
        ];
        const answers = await inquirer.prompt(questions);
        var hash = sha256(answers.message);
        console.log("Message Hash : ", hash)
        let transport = await TransportNodeHid.open("");

        const eth = new Eth(transport)


        let result = await eth.signPersonalMessage(`44'/550'/0/0/${answers.index}`, Buffer.from(answers.message).toString("hex"))
        var v = result['v'] - 27;
        v = v.toString(16)
        if(v.length < 2){
            v = "0" + v;
        }
        console.log("Signature : 0x" + result['r'] + result['v'] + v)
    }
    catch (error) {
        console.log(error);
    }
}

async function signTx() {

    try {
        const questions = [
            {
                name: 'index',
                type: 'number',
                message: 'Please enter index of public key',
                default: 0
            },
            {
                name: 'gasPrice',
                type: 'string',
                message: 'gasPrice(gwei) : ',
                default: '10'
            },
            {
                name: 'gasLimit',
                type: 'string',
                message: 'gasLimit : ',
                default: '21000'
            },
            {
                name: 'to',
                type: 'string',
                message: "Receipient",
                default: 'xdcdc2c4b448b87d6755174096306cd47c47cc552f2'
            },
            {
                name: 'value',
                type: 'string',
                message: 'Amount(XDC) : ',
                default: "1"
            },
        ];

        const txObject = await inquirer.prompt(questions);
        const to = "0x" + txObject.to.slice(3);

        const tx = [];

        let transport = await TransportNodeHid.open("");
        const eth = new Eth(transport);
        
        let response = await eth.getAddress(`44'/550'/0/0/${txObject.index}`, 0, 1);
        let address = response.address;
        let nonce = await web3.eth.getTransactionCount(address)
        let chainId = await web3.eth.getChainId();

        if(nonce === 0){
            tx.push(encode(web3.utils.toHex(nonce)).slice(1))
        }else{
            tx.push(encode(web3.utils.toHex(nonce)))
        }
        tx.push(encode(web3.utils.toHex(web3.utils.toWei(txObject.gasPrice, 'gwei'))).slice(1))
        tx.push(encode(web3.utils.toHex(txObject.gasLimit)).slice(1))
        tx.push(encode(to).slice(1))
        tx.push(encode(web3.utils.toHex(web3.utils.toWei(txObject.value, 'ether'))).slice(1))
        tx.push(encode(null).slice(1))
        tx.push(encode(chainId))
        tx.push(encode(null).slice(1))
        tx.push(encode(null).slice(1))

        let tx1 = encode(tx)
        console.log("Review and Confirm Transaction in Ledger Device")
        let result = await eth.signTransaction(`44'/550'/0/0/${txObject.index}`, tx1)

        tx[6] = Buffer.from(result.v, "hex");
        tx[7] = Buffer.from(result.r, "hex");
        tx[8] = Buffer.from(result.s, "hex");

        tx1 = encode(tx);
        let raw = "0x" + tx1.toString("hex");

        console.log("Transaction Confirmed, Broadcasting Transaction")

        const txHash = await web3.eth.sendSignedTransaction(raw);
        console.log(txHash)
    }
    catch (error) {
        if(error.statusCode === 27013)
        console.log("Transaction Rejected")
        else
        console.log(error)
    }
}

async function handleOptions(options) {

    if (options.publicKey) {
        await getPublicKey();
    }
    if (options.signMessage) {
        await signMessage();
    }
    if (options.signTx) {
        await signTx();
    }
    if (options.getVersion) {
        await getVersion();
    }
    if (options.help){
        console.log(INFO)
    }
}

export async function cli(args) {
    let options = parseArgumentIntoOption(args)
    await handleOptions(options)
}

const INFO = `
                    XinFin Companion
    
       This is a companion app for XinFin Ledger App.

    --publicKey -p              To get the Public Key from App.
    --signMessage -m            To sign a Personal Message with Public Key.
    --getVersion -v             To get version of Application.
    --signTx -t                 To send a transaction.
    --help -h                   For Help
`