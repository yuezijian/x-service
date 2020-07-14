const definitions =
  `
    type Domain
    {
      name: String
      note: String

      projects: [Project]
    }

    type Project
    {
      name: String
      note: String

      entities: [Entity]
    }

    type Entity
    {
      name: String
      note: String

      properties: [Property]
    }

    type Property
    {
      name:          String
      note:          String

      type:          String
      not_null:      Boolean
      default_value: String
    }

    type MutationResponseDomain
    {
      success: Boolean!
      message: String

      domain: Domain
    }

    type MutationResponseProject
    {
      success: Boolean!
      message: String

      project: Project
    }

    type MutationResponseEntity
    {
      success: Boolean!
      message: String

      entity:  Entity
    }

    type MutationResponseProperty
    {
      success: Boolean!
      message: String

      property: Property
    }

    type Query
    {
      orm: String
    }
  `;


export default definitions;
