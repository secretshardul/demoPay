# Multi language module

##Inputs:
**'event'** object contains message_id, locale and values
```
{
 "message_id": "payment_success_message",
 "locale": "eng", //language code of choice
 "values": ["john", "9112345678", "Tata power", "1000"] //values to be substituted
}
```
##Output:
Message templates for each locale are **hardcoded in separate files**(xml, json or yml). Function finds out template associated
with message_id for given locale, performs substitutions with values and returns the result string.
```
{
 "eng": "John(9112345678) successfully paid Rs 1000 to Tata power", //english is always there
 "hin": "John(9112345678) ने Tata power को 1000 रुपये का सफलतापूर्वक भुगतान किया" //selected locale
}
```
###Example
- Suppose template for "payment_success_message" is "%name(%number) successfully paid Rs %amount to %service".
- Output: "John(9112345678) successfully paid Rs 1000 to Tata power"

For Hindi
- Template is "%name(%number) ने %service को %amount रुपये का सफलतापूर्वक भुगतान किया"
- Output: "John(9112345678) ने Tata power को 1000 रुपये का सफलतापूर्वक भुगतान किया"

##Instructions:
1. Add code stays in i18n folder. handler.js contains main function.
2. Test locally using ```sls invoke local -f i18n -l```
3. NPM modules can be installed in usual manner using ```npm install``

##Reference:
I've added some templates in eng.yml and hin.yml in /locales folder. The function selects a template based on
entered message_id and locale. You can create this from scratch using a YML parser or use an npm module like i18n.
