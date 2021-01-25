module.exports = {
    en: {
        translation: {
            WELCOME_MSG: 'Hello, you seems to be hungry, let me check a restaurant.',
            WELCOME_BACK_MSG: "Happy to see you again !",
            REGISTER_MSG: 'Sorry, there is some mistake, would you retry by asking me to "register the address" or to "registrer the price".',
            
            REJECTED_ADDRESS: "Your address is not registered. Ask me to \"Register the address\"",
            REJECTED_PRICE: "Your preferences are not registered. retry by asking me to \"register the price\".",
            REJECTED_MSG: 'For more informations, ask me help. If you want to leave, tell "stop". ',
            
            POSITIVE_SOUND:"<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>",
            GREETING_SPEECHCON: "<say-as interpret-as='interjection'>Cocorico</say-as>",
            DOUBT_SPEECHCON: "<say-as interpret-as='interjection'>Hmmm</say-as>",
            
            MISSING_ADDRESS: "$t(DOUBT_SPEECHCON). It seems to me that you haven't told me your address yet. Ask me to \"Register the address\".",
            MISSING_PRICE: "$t(DOUBT_SPEECHCON). It seems to me that you haven't told me your desired maximum price yet. Ask me to \"Register the price\".",
            MISSING_STORES: "$t(DOUBT_SPEECHCON). It seems to me that there is no restaurant. Ask me to \"List restaurants\". ",
            
            COUNT_STORE: 'There are {{count}} restaurant next to you.',
            COUNT_MENU: 'The restaurant contains {{count}} menu.',
            
            NO_STORES: '0 restaurant matches',
            
            CONFIRM_MENU: `OK. you chose {{menu}}, the prepartion time will be about {{time}} minutes. And the price will be {{price}} euros.`,
            
            REMOVE_PREF: `Your preferences are updated.`,
            
            HELP_MSG: 'You can say Hello to me ! How can I help ?',
            REFLECTOR_MSG: 'You just triggered {{intent}}',
            GOODBYE_MSG: 'Goodbye !',
            FALLBACK_MSG: 'Sorry, I don\t know about that. Please try again',
            ERROR_MSG: 'Sorry, there was an error. Please try again',
            
            API_ERROR_MSG: "Sorry, I am unable to connect to the external API to obtain results. Can you please try later.",
        }
    },
    fr: {
        translation: {
            WELCOME_MSG: "Bonjour, Je vois que vous avez faim. Attendez quelques petites secondes, je vous trouve un restaurant.",
            WELCOME_BACK_MSG: "Content de vous revoir !",
            REJECTED_MSG: "Désolé, une erreur s'est produite lors de votre demande, veuillez réessayer en demandant d'enregister l'adresse ou le prix.",
            REJECTED_ADDRESS: "Votre adresse n'a pas été enregistrer, Dites simplement \"Enregistre mon adresse\".",
            REJECTED_PRICE: "Vos préférences de prix n'ont pas été enregsitré. Dites simplement \"Enregistre le prix\"",
            REPROMPT_MSG: "Pour obtenir plus d'informations sur ce que je peux faire pour vous, demandez moi de l'aide. Si vous voulez quitter la skill, dites simplement 'stop'. ",
            
            POSITIVE_SOUND:"<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>",
            GREETING_SPEECHCON: "<say-as interpret-as='interjection'>Cocorico</say-as>",
            DOUBT_SPEECHCON: "<say-as interpret-as='interjection'>Hmmm</say-as>",
            
            MISSING_ADDRESS: "$t(DOUBT_SPEECHCON). Il me semble que vous ne m'avez pas encore dit votre adresse. Dites simplement \"Enregistre mon adresse\". À l'avenir, votre adresse sera automatiquement utilisé. ",
            MISSING_PRICE: "$t(DOUBT_SPEECHCON). Il me semble que vous ne m'avez pas encore dit votre prix maximum souhaité. Dites simplement \"Enregistre le prix\". À l'avenir, vos préférences seront automatiquement utilisé. ",
            MISSING_STORES: "$t(DOUBT_SPEECHCON). Il me semble qu'aucune liste de restaurants n'existe. Dites \"Liste moi les restaurants\". ",
            
            COUNT_STORE: '$t(POSITIVE_SOUND). Il y a actuellement {{count}} restaurant au alentour.',
            COUNT_MENU: '$t(GREETING_SPEECHCON). Le restaurant contient {{count}} menu.',
            
            NO_STORES: 'Il n\'y a aucun restaurants correspondant à votre réponse',
            
            CONFIRM_MENU: `OK. Vous avez choisi {{menu}}, le temps de livraison sera de {{time}} minutes. Et le prix est de {{price}} euros`,
            CONFIRM_ADDRESS: 'Votre adresse à bien été enregistré. ',
            
            REMOVE_PREF: `Les préférences ont étés mis à jour.`,
            
            SAY_PRICE : 'Dites "Enregistre le prix". À l\'avenir vos préférences seront automatiquement utilisé.',
            
            HELP_MSG: "Dites-moi simplement \"enregistre mon adresse\". ",
            GOODBYE_MSG: ['Au revoir {{name}}!', 'A bientôt {{name}}', 'A la prochaine fois {{name}}'],
            REFLECTOR_MSG: "Vous avez invoqué l'intention {{intent}}",
            FALLBACK_MSG: 'Désolé, je ne sais pas. Pouvez vous reformuler ?',
            ERROR_MSG: "Désolé, je n'ai pas compris. Pouvez vous reformuler ?",
            
            API_ERROR_MSG: "Désolé, je n'arrive pas à me connecter à l'API externe pour obtenir des résultats. Veuillez réessayer plus tard. ",
        }
    },
    "fr-CA": {
        translation: {
            WELCOME_MSG: "Bienvenue sur la skill des fêtes !",
        }
    }
}