var app = require('express')();
var cfenv = require('cfenv');
const {dialogflow, SimpleResponse} = require('actions-on-google')

appEnv = cfenv.getAppEnv()
instance = appEnv.app.instance_index ||  0

dialogflowApp = dialogflow()

dialogflowApp.intent('Default Fallback Intent', (conv)=>{
    conv.ask(new SimpleResponse({
        text: 'texto do node',
        speech: 'texto do node'
    }))
})

app.listen(appEnv.port, function(){
    console.log('Servidor node no ar')
})

app.get('/', (req, res)=>{
    res.json({"texto": "teste express"})
})

app.post('/google', dialogflowApp)