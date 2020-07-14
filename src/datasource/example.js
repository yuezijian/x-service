import { DataSource } from 'apollo-datasource';


class Source extends DataSource
{
  constructor()
  {
    super();
  }

  initialize(config)
  {
  }

  all()
  {
    return Source.array;
  }

  find(id)
  {
    return Source.array.find(v => v.id === id);
  }

  add(name)
  {
    const value = { id: Source.cursor.toString(), name };

    Source.array.push(value);

    Source.cursor += 1;

    return value;
  }

  remove(id)
  {
    const index = Source.array.findIndex(v => v.id === id);

    const value = Source.array[index];

    Source.array.splice(index, 1);

    return value;
  }

  update(id, name)
  {
    const value = Source.array.find(v => v.id === id);

    value.name = name;

    return value;
  }
}

Source.array = [];
Source.cursor = 1;


export default Source;
