#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable max-len */

const natural = require('natural');
const _ = require('lodash');
const fs = require('fs');

export function GenerateClassifier(directory: string) {
  const phrases = {};
  fs.readdirSync(directory).forEach(file => {
    const key = /(.*).js/.exec(file);
    console.log(`loading '${key[1]}'`);
    phrases[key[1]] = require(`${process.cwd()}/${directory}/${file}`);
  });

  const allPhrases = _.flatten(_.values(phrases));

  const classifiers = _.mapValues(phrases, (value, key) => { // eslint-disable-line no-unused-vars
    const classifier = new natural.BayesClassifier();
    const otherPhrases = _.difference(allPhrases, value);

    value.forEach(phrase => classifier.addDocument(phrase, 'true'));
    otherPhrases.forEach(phrase => classifier.addDocument(phrase, 'false'));
    classifier.train();
    return classifier;
  });

  const saveable = _.mapValues(classifiers, classifier => JSON.stringify(classifier));
  fs.writeFile(`${directory}/../classifiers.json`, JSON.stringify(saveable), 'utf8');
}

if (process.argv.length > 2) {
  GenerateClassifier(process.argv[2]);
} else {
  console.error('Need directory to read phrases from');
}
