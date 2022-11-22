import { createServer } from 'node:http'
import { createYoga, createSchema } from 'graphql-yoga'
import numberName from 'number-name';

const maxNumber = 10000;

String.prototype.toCamelCase = function () {
  return this
    .replace(/-([a-z]{1})/, function(v) { return v.toUpperCase().replaceAll('-', ''); })
    .replace(/ ([a-z]{1})/gm, function(v) { return v.toUpperCase().replaceAll(' ', ''); });
};

const schema = createSchema({
  typeDefs: `
    type Query {
      calculate: ResultValue
    }
    type ResultOperand {
      result: Float
      plus: ResultValue
      minus: ResultValue
      multiply: ResultValue
      divide: ResultValue
    }
    type ResultValue {
      ${
        Array(maxNumber).fill(0).map((_, index) => `${numberName(index + 1).toCamelCase()}: ResultOperand`).join('\n')
      }
    }
  `,
  resolvers: {
    Query: {
      calculate: () => [],
    },
    ResultOperand: {
      result: (parent) => eval(parent.join('').replace(/[^-()\d/*+.]/g, '')),
      plus: (parent) => { parent.push("+"); return parent },
      minus: (parent) => { parent.push("-"); return parent },
      multiply: (parent) => { parent.push("*"); return parent },
      divide: (parent) => { parent.push("/"); return parent },
    },
    ResultValue: Array(maxNumber)
      .fill(0)
      .map((_, index) => index + 1)
      .reduce((acc, cur) => {
        acc[numberName(cur).toCamelCase()] = (parent) => { parent.push(cur); return parent };
        return acc;
      }, {}),
  }
})

createServer(createYoga({ schema })).listen(4000, () => {
 console.info('Server is running on http://localhost:4000/graphql')
});
