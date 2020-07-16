import Source from './datasource/postgresql';


const source = new Source();

source.structure().catch(error => console.log(error));
