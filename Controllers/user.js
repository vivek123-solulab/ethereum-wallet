import User from "../Models/user.js";
import sendEmail from "../Utils/sendEmail.js";
import sendToken from "../Utils/jwtToken.js";
import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import abi from '../abi/ERC20.js';
// var balance = 100000

export const createUser = async (req, res) => {
    
    try {
        // var amount =req.body;
        const { email, username, password} = req.body
        const newUser = new User({
            email,
            username,
            password,
            balance
        })
        const existingUser = await User.findOne({email})
        if(existingUser){
            res.json({
                status:false,
                message:"User already exists."
            })
        }else{
            newUser.save(async(_, user) => {
            res.status(201).json(user);
            console.log(user.email);
            if(user){
                // amount = faker.finance.amount()
                console.log('amount===>',balance);
                sendEmail({
                    email: user.email,
                    subject:"Verification Link" ,
                    message:"This is your verification link after signup'<a href='https://blog.logrocket.com/implementing-a-secure-password-reset-in-node-js/'>Please click to view your token.</a>" +"The amount credited to Your wallet is:-" + balance
                })
            }
        })
    }
    } catch (error) {
        return res.status(409).json({ error: error.message })
    }
}

export const createSignIn = async (req, res) => {
    try { 
        const {email} = req.body
        const user = await User.findOne({
            email
        })
        if(user){
            sendToken(user,res);
        }else if(user){
            res.status(200).json(user)
        }else if(!user) return res.status(404).json({
            sucess:false,
            message:"User not found."
        })
    } catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const transfer = async (req, res) => {
    try {
        const {email,amount,to} = req.body
        const user = await User.findOne({
            email,amount,to
        })
        if(user){

            const init = async() => {
                const provider = new  HDWalletProvider(
                  process.env.ADMIN_PRIVATE_KEY,
                  'https://ropsten.infura.io/v3/0161fdc5c1fc46299e58286ab509550e'
                );
                const web3 = new Web3(provider);
                const accounts= await web3.eth.getAccounts();
				console.log(accounts)
                const contract = new web3.eth.Contract(abi,process.env.CONTRACT_ADDRESS);
			   	console.log('accounts===>', accounts)
			   
				var ERC2OTransferReceipt= await contract.methods.transfer(to,1000).send({from:process.env.ADMIN_PUBLIC_KEY});
				console.log('ERC2OTransferReceipt===>',ERC2OTransferReceipt)

			   console.log('accounts===>', accounts)
            };
            await init();
            res.json({
                status:true,
                message:"Transaction Successfull."
            })
        }else if(!user) return res.status(404).json({
            sucess:false,
            message:"User not found."
        })
    } catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const getBalance = async (req, res, next) => {
	var ERC2OTransferReceipt;
	const init = async() => {
	    const provider = new  HDWalletProvider(
	 	process.env.ADMIN_PRIVATE_KEY,
		'https://ropsten.infura.io/v3/0161fdc5c1fc46299e58286ab509550e'
		);
		const web3 = new Web3(provider);
		const getAccounts= await web3.eth.getAccounts();
		console.log('accounts===>', getAccounts)
		const contract = new web3.eth.Contract(abi,process.env.CONTRACT_ADDRESS);
					   
		ERC2OTransferReceipt= await contract.methods.balanceOf(process.env.ADMIN_PUBLIC_KEY).call();
		console.log('ERC2OTransferReceipt===>',ERC2OTransferReceipt.toString())	
	};
	await init();
    res.status(200).json({
      success: true,
      message: 'Balance of the user:-' + ERC2OTransferReceipt.toString(),
    })
}

export const getTransactionDetailsEvent = async (req, res, next) => {
	const provider = new  HDWalletProvider(
		process.env.ADMIN_PRIVATE_KEY,
	   'https://ropsten.infura.io/v3/0161fdc5c1fc46299e58286ab509550e'
	);
	const web3 = new Web3(provider);
	const getAccounts= await web3.eth.getAccounts();
	console.log('accounts===>', getAccounts)
	const contract = new web3.eth.Contract(abi,process.env.CONTRACT_ADDRESS);
    let latest_block = await web3.eth.getBlockNumber();
    let historical_block = latest_block - 10000; // you can also change the value to 'latest' if you have a upgraded rpc
    console.log("latest: ", latest_block, "historical block: ", historical_block);
    const events = await contract.events.Transfer(
        'Transfer', // change if your looking for a different event
        { fromBlock: historical_block, toBlock: 'latest' }
    );
    console.log("events ===>", events.arguments)
};