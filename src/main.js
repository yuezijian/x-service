import orm from './service/datasource/orm';


orm.reset().catch(error => console.log(error));
