import orm from './datasource/orm';


orm.reset().catch(error => console.log(error));
