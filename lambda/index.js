const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');

const util = require('./util');
const interceptors = require('./interceptors');
const service = require('./service');
const constants = require('./constants');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const {t, attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        const streetNumber = sessionAttributes['streetNumber'];
        const street = sessionAttributes['street'];
        const code = sessionAttributes['code'];
        const city = sessionAttributes['city'];
        const price = sessionAttributes['price'];
        const deliveryCharges = sessionAttributes['deliveryCharges'];
        const preparationTime = sessionAttributes['preparationTime'];
        const sessionCounter = sessionAttributes['sessionCounter'];
        
        const addressAvailable = streetNumber && street && code && city;
        const priceAvailable = price && deliveryCharges && preparationTime;
        
        let speechText = !sessionCounter ? t('WELCOME_MSG') : t('WELCOME_BACK_MSG');
        
        if (addressAvailable) {
            if (priceAvailable) {
                return SayStoresIntentHandler.handle(handlerInput);
            }
            speechText += t('MISSING_PRICE');
            
            return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
        }
        
        speechText += t('MISSING_ADDRESS');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
            
    }
};

const RegisterAddressIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterAddressIntent';
    },
    handle(handlerInput) {
        const {requestEnvelope, responseBuilder, attributesManager, t} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            const streetNumber = Alexa.getSlotValue(requestEnvelope, 'streetNumber');
            const street = Alexa.getSlotValue(requestEnvelope, 'street');
            const code = Alexa.getSlot(requestEnvelope, 'code');
            const city = Alexa.getSlot(requestEnvelope, 'city');
            
            sessionAttributes['streetNumber'] = streetNumber;
            sessionAttributes['street'] = street;
            sessionAttributes['code'] = code;
            sessionAttributes['city'] = city
            
            return responseBuilder
            .speak(t('SAY_PRICE'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse()
            
        } 
        return responseBuilder
            .speak(t('REJECTED_ADDRESS'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
    }
};

const RegisterPriceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegisterPriceIntent';
    },
    handle(handlerInput) {
        const {requestEnvelope, responseBuilder, attributesManager, t} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        const streetNumber = sessionAttributes['streetNumber'];
        const street = sessionAttributes['street'];
        const code = sessionAttributes['code'];
        const city = sessionAttributes['city'];
        
        const addressAvailable = streetNumber && street && code && city;
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            
            if(addressAvailable) {
                const price = Alexa.getSlotValue(requestEnvelope, 'price');
                const deliveryCharges = Alexa.getSlotValue(requestEnvelope, 'deliveryCharges');
                const preparationTime = Alexa.getSlotValue(requestEnvelope, 'preparationTime');
                
                sessionAttributes['price'] = price;
                sessionAttributes['deliveryCharges'] = deliveryCharges;
                sessionAttributes['preparationTime'] = preparationTime;
                
                return SayStoresIntentHandler.handle(handlerInput)    
            }
            
            return responseBuilder
            .speak(t('MISSING_ADDRESS'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse(); 
            
        } 
        return responseBuilder
            .speak(t('REJECTED_PRICE'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
    }
};

const SayStoresIntentHandler = {
    canHandle({requestEnvelope}) {
        return Alexa.getRequestType(requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(requestEnvelope) === 'SayStoresIntent';
    },
    async handle(handlerInput) {
        const {t, responseBuilder, attributesManager} = handlerInput
        const sessionAttributes = attributesManager.getSessionAttributes();
        const code = sessionAttributes['code'];
        const price = sessionAttributes['price'];
        const deliveryCharges = sessionAttributes['deliveryCharges'];
        const preparationTime = sessionAttributes['preparationTime'];
        
        const sumPrice = parseInt(price) + parseInt(deliveryCharges);
        
        const infoAvailable = code && price && deliveryCharges && preparationTime;
        let outputSpeech = 'This is the default message.';

        if (infoAvailable) {
            
            await service.getRemoteData(`https://immense-spire-14860.herokuapp.com/stores/${code.value}?price=${sumPrice.toString()}&preparationTime=${preparationTime}`)
              .then((response) => {
                const data = JSON.parse(response);
                
                sessionAttributes['stores'] = data;
                
                outputSpeech = t('COUNT_STORE', {count: data.length});
                
                for (let i = 0; i < data.length; i += 1) {
                    if (i === 0) {
                        outputSpeech = `${outputSpeech} : ${data[i].name}, `;
                      } else if (i === data.length - 1) {
                        outputSpeech = `${outputSpeech}et ${data[i].name}.`;
                      } else {
                        outputSpeech = `${outputSpeech + data[i].name}, `;
                      }
                }
        
              })
              .catch((err) => {
                console.log(`ERROR: ${err.message}`);
                outputSpeech = err.message;
              });
            
            return handlerInput.responseBuilder
                .speak(outputSpeech)
                .addDelegateDirective({
                    name: 'ChooseStoreIntent',
                    confirmationStatus: 'NONE',
                    slots:{}
                })
                .reprompt(t('REPROMPT_MSG'))
                .getResponse();
        } else {
            let errorSpeech = t('MISSING_ADDRESS');
            if(code) {
                errorSpeech = t('MISSING_PRICE');
            }
            return responseBuilder
            .speak(errorSpeech)
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
            
        }
    }
}

const ChooseStoreIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChooseStoreIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, serviceClientFactory, requestEnvelope, responseBuilder, t} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        const store = Alexa.getSlotValue(requestEnvelope, 'store');
        const stores = sessionAttributes['stores'];
        
        let outputSpeech = '';
        let menus = [];
        
        if (intent.confirmationStatus === 'CONFIRMED') {
            if (stores) {
                const selectStore = stores.filter(st => (st.name).toLowerCase() === store.toLowerCase());
                sessionAttributes['store'] = selectStore[0];
                if (selectStore[0]) {
                    let listIdMenu = selectStore[0].menus;
                    
                    let str = '';
                    for(let i = 0; i < listIdMenu.length; i += 1) {
                        if (i===0){
                            str += listIdMenu[i];
                        } else {
                            str += ',' + listIdMenu[i]
                        }
                    }
                    
                    await service.getRemoteData(`https://immense-spire-14860.herokuapp.com/menu?listIdMenu=${str}`)
                      .then((response) => {
                        const data = JSON.parse(response);
                        sessionAttributes['menus'] = data;
                        outputSpeech = t('COUNT_MENU', {count: data.length});
                        
                        for (let i = 0; i < data.length; i += 1) {
                            if (i === 0) {
                                // first record
                                outputSpeech = `${outputSpeech} : ${data[i].name}, `;
                              } else if (i === data.length - 1) {
                                // last record
                                outputSpeech = `${outputSpeech}et ${data[i].name}.`;
                              } else {
                                // middle record(s)
                                outputSpeech = `${outputSpeech + data[i].name}, `;
                              }
                        }
                
                      })
                      .catch((err) => {
                        console.log(`ERROR: ${err.message}`);
                        // set an optional error message here
                        outputSpeech = err.message;
                      });
                    
                    return handlerInput.responseBuilder
                        .speak(outputSpeech)
                        .addDelegateDirective({
                            name: 'ConfirmMenuIntent',
                            confirmationStatus: 'NONE',
                            slots:{}
                        })
                        .reprompt(t('REPROMPT_MSG'))
                        .getResponse();
                    
                } else {
                    return handlerInput.responseBuilder
                        .speak(t('NO_STORES'))
                        .reprompt(t('REPROMPT_MSG'))
                        .getResponse();
                }
            }
            return handlerInput.responseBuilder
                    .speak(t('MISSING_STORES'))
                    .reprompt(t('REPROMPT_MSG'))
                    .getResponse();
                    
        }
        
        return handlerInput.responseBuilder
            .speak(t('REJECTED_MSG'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
        
    }
}

const ConfirmMenuIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfirmMenuIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, requestEnvelope, responseBuilder, t} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;
        
        const menu = Alexa.getSlotValue(requestEnvelope, 'menu');
        sessionAttributes['menu'] = menu;
        const menus = sessionAttributes['menus'];
        const store = sessionAttributes['store'];
        
        let outputSpeech = '';
        
        if (intent.confirmationStatus === 'CONFIRMED') {
        
            const selectMenu = menus.filter(item => (item.name).toLowerCase() === menu.toLowerCase());
            
            if (selectMenu[0]) {
                let menu = selectMenu[0];
                
                //outputSpeech = `OK. Vous avez choisi ${menu.name}, le temps de livraison sera de ${store.avg_prep_time} minutes. Et le prix est de ${menu.price} euros`;
                outputSpeech = t('CONFIRM_MENU', {menu: menu.name, time: store.avg_prep_time, price: menu.price});
                return handlerInput.responseBuilder
                    .speak(outputSpeech)
                    .reprompt(t('REPROMPT_MSG'))
                    .getResponse();
                
            } else {
                return handlerInput.responseBuilder
                    .speak(t('REJECTED_MSG'))
                    .reprompt(t('REPROMPT_MSG'))
                    .getResponse();
            }
            
        }
        
        return handlerInput.responseBuilder
            .speak(t('REJECTED_MSG'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
    }
}

const DeletePreferencesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeletePreferencesIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope, responseBuilder, t} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        sessionAttributes['streetNumber'] = null;
        sessionAttributes['street'] = null;
        sessionAttributes['city'] = null;
        sessionAttributes['code'] = null;
        sessionAttributes['price'] = null;
        sessionAttributes['deliveryCharges'] = null;
        sessionAttributes['preparationTime'] = null;
        
        return handlerInput.responseBuilder
            .speak(t('REMOVE_PREF'))
            .reprompt(t('REPROMPT_MSG'))
            .getResponse();
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const {t, attributesManager} = handlerInput
        const sessionAttributes = attributesManager.getSessionAttributes();
        const name = sessionAttributes['name']

        const speakOutput = t('GOODBYE_MSG', {name});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RegisterAddressIntentHandler,
        RegisterPriceIntentHandler,
        SayStoresIntentHandler,
        ChooseStoreIntentHandler,
        ConfirmMenuIntentHandler,
        DeletePreferencesIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        interceptors.LocalisationRequestInterceptor,
        interceptors.LoggingRequestInterceptor,
        interceptors.LoadAttributesRequestInterceptor,
        interceptors.LoadNameRequestInterceptor,
        interceptors.LoadTimezoneRequestInterceptor)
    .addResponseInterceptors(
        interceptors.LoggingResponseInterceptor,
        interceptors.SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(util.getPersistenceAdapter())
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();