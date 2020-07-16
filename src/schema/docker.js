const definitions =
  `
    type Environment
    {
      name:  String
      value: String
    }

    type Network
    {
      name:    String
      gateway: String
      address: String
    }

    type Port
    {
      type:      String
      container: String
      host:      String
    }

    type Volume
    {
      source:      String
      destination: String
      mode:        String
    }

    type Container
    {
      id:           ID
      name:         String
      image:        String
      status:       String
      created:      String
      command:      String
      directory:    String
      environments: [Environment]
      networks:     [Network]
      ports:        [Port]
      volumes:      [Volume]
    }

    type Image
    {
      id:           ID
      repository:   String
      tag:          String
      size:         String
      created:      String
      architecture: String
      system:       String
      command:      String
      directory:    String
      environments: [Environment]
      ports:        [Port]
    }

    type Query
    {
      docker: String
    }
  `
;


export default definitions;
