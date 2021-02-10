import React, {useEffect} from 'react';
import ListComponent from "../../components/ListComponent";
import {useSelector} from "react-redux";
import {OfficerActions} from "../../../state/actions";
import Loading from "../../components/Loading";
import {useHistory} from "react-router-dom";
import {Button} from "@material-ui/core";
import ButtonBar from "../../components/ButtonBar";
import {useList} from "../../../state/utilities/use_list";

const OfficerList = () => {

  const items = useSelector(state => state.Officers.items);
  const loading = useSelector(state => state.Officers.loading);
  useList(OfficerActions, 'admin');

  const history = useHistory();

  const detailRoute = `/admin/officers/view/:id`;

  const renderer = (it) => (
    [
      <td key='name'>{it.name}</td>,
      <td key='region'>{it.region}</td>
    ]
  )

  if (loading || items === undefined) {
    return (<Loading />);
  }

  return (
    <>
      <h2>Conservation Officers</h2>
      <ButtonBar>
        <Button
          variant="contained"
          color="primary"
          onClick={() => history.push('/admin/officers/add')}
        >Create New</Button>
      </ButtonBar>

      <ListComponent items={items} detailRoute={detailRoute} headers={['Name', 'Region']} rowRenderer={renderer} />
    </>
  );
};

export default OfficerList;
