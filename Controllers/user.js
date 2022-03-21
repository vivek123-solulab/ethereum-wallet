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
            password
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
                // console.log('amount===>',balance);
                sendEmail({
                    email: user.email,
                    subject:"Verification Link" ,
                    message:"This is your verification link after signup'<a href='https://blog.logrocket.com/implementing-a-secure-password-reset-in-node-js/'>Please click to view your token.</a>" +"The amount credited to Your wallet is:-"
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
    var ERC2OTransferReceipt,ERC2OBalanceReceipt;
    try {
        const {email,amount,to} = req.body
        const user = await User.findOne({
            email,amount,to
        })
        if(user){

            const init = async() => {
                const provider = new  HDWalletProvider(
                  process.env.ADMIN_PRIVATE_KEY,
                  process.env.INFURA_URL
                );
                const web3 = new Web3(provider);
                const accounts= await web3.eth.getAccounts();
				console.log(accounts)
                const contract = new web3.eth.Contract(abi,process.env.CONTRACT_ADDRESS);
			   	console.log('accounts===>', accounts)
			   
				ERC2OTransferReceipt= await contract.methods.transfer(to,1000).send({from:process.env.ADMIN_PUBLIC_KEY});
				console.log('ERC2OTransferReceipt===>',ERC2OTransferReceipt)

                ERC2OBalanceReceiptofuser= await contract.methods.balanceOf(process.env.USER_PUBLIC_KEY).call();
		        console.log('ERC2OTransferReceipt===>',ERC2OBalanceReceiptpofuser.toString())	

			   console.log('accounts===>', accounts)
            };
            await init();
            if(ERC2OTransferReceipt){
                res.status(200).json({
                    success:true,
                    message:"Transaction Successfull."
                })
                sendEmail({
                    email: user.email,
                    subject:"Transaction Successfull !!!" ,
                    message:"Your Transaction is been successfully sent to user:-" + user.email + "The amount is been credited to the user is:-" + ERC2OBalanceReceiptofuser
                })
            }else if(!ERC2OTransferReceipt){
                res.status(404).json({
                    success:false,
                    message:"Insufficient Balance...Transaction Failed!!!"
                }) 
            }
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
		process.env.INFURA_URL
		);
		const web3 = new Web3(provider);
		const getAccounts= await web3.eth.getAccounts();
		console.log('accounts===>', getAccounts)
		const contract = new web3.eth.Contract(abi,process.env.CONTRACT_ADDRESS);
					   
		ERC2OBalanceReceiptofadmin= await contract.methods.balanceOf(process.env.ADMIN_PUBLIC_KEY).call();
		console.log('ERC2OTransferReceipt===>',ERC2OBalanceReceiptofadmin.toString())	
	};
	await init();
    res.status(200).json({
      success: true,
      message: 'Balance of the user:-' + ERC2OBalanceReceiptofadmin.toString(),
    })
}

export const getTransactionDetailsEvent = async (req, res, next) => {
	const provider = new  HDWalletProvider(
		process.env.ADMIN_PRIVATE_KEY,
	   process.env.INFURA_URL
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