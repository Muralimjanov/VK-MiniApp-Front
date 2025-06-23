{fetchedUser && (
        <Group header={<Header size="s">User Data Fetched with VK Bridge</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Navigation Example2</Header>}>
        <Div>
          <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('persik')}>
            Покажите Персика, пожалуйста!
          </Button>
        </Div>
      </Group>




{fetchedUser && (
        <Group header={<Header size="s">User Data Fetched with VK Bridge</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Navigation Example2</Header>}>
      <Div>
        <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('persik')}>
          Покажите Персика, пожалуйста!
        </Button>
      </Div>
    </Group>


<Group header={<Header size="s">Ваша заявка №3</Header>}>
      <TableApplication/>
      <div style={{'margin': '10px'}}>
        <label>Залог: 600.00 руб</label>
      </div>
      <EditApplicationForm/>
    </Group>
    