import React, { useState } from "react";
import gql from "graphql-tag";
import PetBox from "../components/PetBox";
import NewPet from "../components/NewPet";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Loader from "../components/Loader";

const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    type
    name
    img
  }
`;

const ALL_PETS = gql`
  {
    pets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`;

const NEW_PET = gql`
  mutation createPet($input: NewPetInput!) {
    addPet(input: $input) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  const { data, loading, error } = useQuery(ALL_PETS);
  const [newPet, pet] = useMutation(NEW_PET, {
    update(cache, { data: { addPet } }) {
      const data = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [addPet, ...data.pets] },
      });
    },
  });

  const onSubmit = (input) => {
    setModal(false);
    newPet({
      variables: { input },
    });
  };

  if (loading) return <Loader />;
  if (error) return <p>Error!</p>;

  const petsList = data.pets.map((pet) => (
    <div className="col-xs-12 col-md-4 col" key={pet.id}>
      <div className="box">
        <PetBox pet={pet} />
      </div>
    </div>
  ));

  if (modal) {
    return (
      <div className="row center-xs">
        <div className="col-xs-8">
          <NewPet onSubmit={onSubmit} onCancel={() => setModal(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <div className="row">{petsList}</div>
      </section>
    </div>
  );
}
