'use strict';
const  languagetest= require('./locales/languages.json');
console.log(languagetest.english.invoke);
module.exports.main = async event => {
    /**Multi language module
     *Read instructions first
     *
     *inorder to read any parameter use the .operater as below
     *
     * languagetest.english.invoke
     * below is a small example of its console log print
     */

    console.log(languagetest.english.invoke);
};