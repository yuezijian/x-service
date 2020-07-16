import { DataSource } from 'apollo-datasource';

import { execSync } from 'child_process';


function execute(command)
{
  const option =
    {
      windowsHide: true
    };

  let stdout = null;
  let stderr = null;

  try
  {
    stdout = execSync(command + ' --format "{{ json . }}"', option).toString();
  }
  catch (error)
  {
    stderr = error.message;
  }

  return { stdout, stderr };
}


class Source extends DataSource
{
  constructor()
  {
    super();
  }

  initialize(config)
  {
  }

  containers()
  {
    const { stdout, stderr } = execute('docker container ls --all');

    const json = `{ "data": [ ${ stdout.substr(0, stdout.length - 1).replace(/\n/g, ',') } ] }`;

    const result = [];

    for (const record of JSON.parse(json).data)
    {
      const object =
        {
          id:      record.ID,
          name:    record.Names,
          image:   record.Image,
          created: record.RunningFor,
          status:  record.Status
        };

      result.push(object);
    }

    return result;
  }
}


export default Source;
