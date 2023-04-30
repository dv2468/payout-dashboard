import {
    Environments,
    IMerchant,
    Method,
    type TWebhookTypes,
} from 'method-node';

const method = new Method({
    apiKey: process.env.METHOD_API_LEY,
    env: Environments.dev,
});

interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
}

interface CorporateEntityProp {
    name: string;
    dba: string;
    ein: string;
    address: Address;
}

interface IndividualEntityProp {
    firstName: string;
    lastName: string;
    email?: string;
    dob?: string;
}

interface CreateCheckingAccountProp {
    entityId: string;
    routingNumber: string;
    accountNumber: string;
}

interface CreateLiabilityAccountProp {
    entityId: string;
    merchantId: string;
    accountNumber: string;
}

interface CreatePaymentProp {
    amount: number;
    sourceAccountId: string;
    detinationAccountId: string;
}

interface CreateWebhookProp {
    type: TWebhookTypes;
}

interface GetPaymentStatusProp {
    id: string;
}

const HARD_CODED_PHONE_NUMBER = '+15121231111';
const createCheckingAccount = async (props: CreateCheckingAccountProp) => {
    return await method.accounts.create({
        holder_id: props.entityId,
        ach: {
            routing: props.routingNumber,
            number: props.accountNumber,
            type: 'checking',
        },
    });
};

const findMerchants = async (plaidId: string): Promise<IMerchant[]> => {
    return await method.merchants.list({
        'provider_id.plaid': plaidId,
    });
};

const createLiabilityAccount = async (props: CreateLiabilityAccountProp) => {
    return await method.accounts.create({
        holder_id: props.entityId,
        liability: {
            mch_id: props.merchantId,
            account_number: props.accountNumber,
        },
    });
};

const createIndividualEntity = async (props: IndividualEntityProp) => {
    return await method.entities.create({
        type: 'individual',
        individual: {
            first_name: props.firstName,
            last_name: props.lastName,
            phone: HARD_CODED_PHONE_NUMBER,
            email: props.email,
            dob: props.dob,
        },
    });
};

const createCoporateEntity = async (prop: CorporateEntityProp) => {
    const ent = await method.entities.create({
        type: 'c_corporation',
        corporation: {
            name: prop.name,
            dba: prop.dba,
            ein: prop.ein,
            owners: [],
        },
        address: {
            line1: prop.address.line1,
            line2: prop.address.line2,
            city: prop.address.city,
            state: prop.address.state,
            zip: prop.address.zip,
        },
    });

    return ent;
};

const createPayment = async (props: CreatePaymentProp) => {
    return await method.payments.create({
        amount: props.amount,
        source: props.sourceAccountId,
        destination: props.detinationAccountId,
        description: 'Loan Pmt',
    });
};

const getPaymentStatus = async (props: GetPaymentStatusProp) => {
    return await method.payments.get(props.id);
};

const createWebhook = async (props: CreateWebhookProp) => {
    return await method.webhooks.create({
        type: props.type,
        url: process.env.METHOD_WEBHOOK_URL,
    });
};

export {
    createCoporateEntity,
    createIndividualEntity,
    createCheckingAccount,
    createLiabilityAccount,
    createPayment,
    createWebhook,
    getPaymentStatus,
    findMerchants,
};
