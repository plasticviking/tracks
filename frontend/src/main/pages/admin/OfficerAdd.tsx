import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from "react-router-dom";
import {AuthenticationContext} from "../../../common/components/AuthRequired";
import {KeycloakInstance} from "keycloak-js";
import axios from "axios";
import CONFIG from "../../../config";
import Loading from "../../../common/components/Loading";
import FormGroup from "../../../common/components/FormGroup";

const OfficerAdd = () => {
  const history = useHistory();

  const [referenceData, setReferenceData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const authContext = useContext(AuthenticationContext);
  const keycloakInstance: KeycloakInstance = authContext.keycloakInstance;

  useEffect(() => {
    keycloakInstance.updateToken(30).then(() => {
      axios.get(`${CONFIG.API_BASE}/api/v1/admin/regions`, {
        headers: authContext.requestHeaders(),
      }).then((response) => {
        setReferenceData({regions: response.data});
        setLoaded(true);
      });
    });

  }, []);

  if (!loaded) {
    return (<Loading />);
  }

  return (
    <>
      <h2>New Commercial Operator</h2>
      <form>
        <div className={'editPane'}>
          <FormGroup>
            <label htmlFor={'name'}>Name</label>
            <input type={'text'} name={'name'} placeholder={'Conservation Officer\'s Name'} />
          </FormGroup>
          <FormGroup>
            <label htmlFor={'region'}>Region</label>
            <select name={'region'}>
              <option disabled selected> Region</option>

              {referenceData.regions.map((r, i) => (
                <option key={i} value={r.id}>{r.region}</option>
              ))}

            </select>

          </FormGroup>

          {/*@todo date pickers for start and end date*/}
        </div>

        {(history.length >= 1) &&
        <button onClick={() => history.push('/admin/officers/list')}>Go back</button>
        }
        <button disabled={true} type={"submit"}>Save</button>

      </form>

    </>
  )
};

export default OfficerAdd;