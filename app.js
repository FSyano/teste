var app = require('express')();
var cfenv = require('cfenv');
const bodyParser = require('body-parser')
const {dialogflow, SimpleResponse} = require('actions-on-google')

appEnv = cfenv.getAppEnv()
instance = appEnv.app.instance_index ||  0

var dialogflowApp = dialogflow()

dialogflowApp.intent('Default Fallback Intent', (conv)=>{
    console.log('aqui input: ')
    console.log(conv.request.inputs[0].rawInputs[0].query)
    conv.ask(new SimpleResponse({
        text: 'texto do node',
        speech: 'texto do node'
    }))
})

app.use(bodyParser.json())

app.listen(appEnv.port, function(){
    console.log('Servidor node no ar')
})

app.get('/', (req, res)=>{
    res.json({"texto": "teste express"})
})

app.post('/google', dialogflowApp)