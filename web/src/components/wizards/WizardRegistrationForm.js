import React from 'react';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {createLoadingSelector, createErrorMessageSelector} from '../../selectors';
import {Button} from 'semantic-ui-react';
import {registerWizard} from '../../actions';
import {REGISTER_WIZARD} from '../../actions/types';

//validation functions
const minValue = min => value => value && value < min ? `Must be at least ${min}` : undefined;
const minValue0 = minValue(0);

class WizardRegistrationForm extends React.Component{
    state = {loading: false}

    renderError({error, touched}){
        if (touched && error){
            return (
                <div className="ui error message">
                    <div className="header">
                        {error}
                    </div>
                </div>
            );
        }
    }

    renderInput = ({input, label, meta, type, step}) => {
        const className = `field ${meta.error && meta.touched ? 'error': ''}`;
        return(
            <div className={className}>
                <label>{label}</label>
                <input {...input} autoComplete="off" type={type}  step={step}/>
                {this.renderError(meta)}
            </div>
        )
    }

    onSubmit = (formValues) => {
        this.props.registerWizard(formValues, this.props.wizardId);
    }

    render(){
        return(
            <form
            onSubmit={this.props.handleSubmit(this.onSubmit)}
            className="ui form error"
        >
            <Field
                name="amount"
                component={this.renderInput}
                label="Price per unit of wizard power (ETH)"
                type="number"
                step="any"
                validate={[minValue0]}
            >
            </Field>
            <Button compact fluid loading={this.props.isFetching} className="ui button primary">
                Register Wizard
            </Button>   
            
        </form>
        )
    }
}

const validate = (formValues) => {
    const errors = {};
    if(!formValues.amount){
        errors.amount = "Enter an amount in ETH above 0"
    }
    return errors;
}

const loadingSelector = createLoadingSelector([REGISTER_WIZARD]);
const errorSelector = createErrorMessageSelector([REGISTER_WIZARD]);
const mapStateToProps = (state) => {
    return {
        isFetching: loadingSelector(state),
        error: errorSelector(state)
    }
}

const ConnectedWizardRegistrationForm = connect(mapStateToProps, {
    registerWizard
})(WizardRegistrationForm);

export default reduxForm({
    form: 'wizardRegistrationForm',
    validate
})(ConnectedWizardRegistrationForm);