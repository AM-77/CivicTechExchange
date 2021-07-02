// @flow

import React from "react";
import ModalWrapper from "../../common/ModalWrapper.jsx";
import { UserAPIData } from "../../utils/UserAPIUtils.js";
import ProjectAPIUtils from "../../utils/ProjectAPIUtils.js";
import { createDictionary, Dictionary } from "../../types/Generics.jsx";
import FormFieldsStore from "../../stores/FormFieldsStore.js";
import htmlDocument from "../../utils/htmlDocument.js";

type Props = {|
  showModal: boolean,
  user: UserAPIData,
  fields: $ReadOnlyArray<string>,
  onEditClose: UserAPIData => void,
|};
type State = {|
  showModal: boolean,
  isProcessing: boolean,
|};

/**
 * Modal for editing user profile fields
 */
class EditUserModal extends React.PureComponent<Props, State> {
  constructor(props: Props): void {
    super(props);
    this.state = {
      showModal: false,
      isProcessing: false,
    };
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({ showModal: nextProps.showModal });
  }

  close(user: ?UserAPIData): void {
    this.setState({ isProcessing: false }, () =>
      this.props.onEditClose(user || this.props.user)
    );
  }

  saveAndClose(editUserResponse: ?Response): void {
    if (editUserResponse) {
      editUserResponse
        .json()
        .then((updatedUser: UserAPIData) => this.close(updatedUser));
    } else {
      this.close(this.props.user);
    }
  }

  confirm(): void {
    this.setState({ isProcessing: true });
    const body: Dictionary<any> = createDictionary(
      this.props.fields,
      (fieldName: string) => fieldName,
      (fieldName: string) => FormFieldsStore.getFormFieldValue(fieldName)
    );
    const cookies: Dictionary<string> = htmlDocument.cookies();
    ProjectAPIUtils.post(
      `/api/user/edit/${this.props.user.id}/details/`,
      body,
      this.saveAndClose.bind(this),
      null,
      { "X-CSRFToken": cookies["csrftoken"] }
    );
  }

  render(): React$Node {
    return (
      <ModalWrapper
        showModal={this.state.showModal}
        headerText="Edit Profile"
        cancelText="No"
        cancelEnabled={!this.state.isProcessing}
        submitText={this.state.isProcessing ? "" : "Save"}
        submitEnabled={!this.state.isProcessing}
        onClickCancel={this.close.bind(this)}
        onClickSubmit={this.confirm.bind(this)}
      >
        {this.props.children}
      </ModalWrapper>
    );
  }
}

export default EditUserModal;
