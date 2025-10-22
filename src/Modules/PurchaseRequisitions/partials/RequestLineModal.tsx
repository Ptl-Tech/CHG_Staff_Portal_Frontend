import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Row,
    Col,
    Select,
    Button,
    Modal,
    DatePicker,
    notification
} from 'antd';
import moment from 'moment';
import type { PurchaseLineItem } from '../../../types/purchaseRequisitions';
import { formatCurrencyUSD } from '../../../utils/currencyFormmatter';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchUoMSetup, selectCommonSetupsData } from '../../../features/common/commonSetups';
import {
    createPurchaseLine,
    fetchPurchaseRequestLines,
    selectSubmitPurchaseLine
} from '../../../features/purchaseRequisitions/purchaseRequisitions';
import { fetchStoreReqDropDowns, selectStoreReqDropDowns } from '../../../features/storeRequisitions/storeRequests';

const { Option } = Select;

interface RequestLineModalProps {
    visible: boolean;
    onClose: () => void;
    itemsList?: any[];
    initialValues?: PurchaseLineItem;
}

const RequestLineModal: React.FC<RequestLineModalProps> = ({
    visible,
    onClose,
    itemsList,
    initialValues
}) => {
    const dispatch = useAppDispatch();
    const documentNo = new URLSearchParams(window.location.search).get('DocumentNo');

    const { uomSetup } = useAppSelector(selectCommonSetupsData);
    const { status, message, error } = useAppSelector(selectSubmitPurchaseLine);
    const { issuingStoreSetup } = useAppSelector(selectStoreReqDropDowns);
    const [form] = Form.useForm();
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [api, contextHolder] = notification.useNotification();

 useEffect(() => {
        dispatch(fetchStoreReqDropDowns());
    }, [dispatch]);

    // Initialize form with initialValues if provided
    useEffect(() => {
        if (initialValues) {
            setSelectedItem({
                itemNo: initialValues.procurementItem,
                activityBudget: initialValues.activityBudget,
                activityActualSpent: initialValues.spentBudget,
            });
            form.setFieldsValue({
                item: initialValues.procurementItem,
                specification: initialValues.specification,
                uom: initialValues.uom,
                unitPrice: initialValues.lineAmount,
                quantity: initialValues.quantity,
                amount: initialValues.amount,
                requiredDate: initialValues.requiredDate ? moment(initialValues.requiredDate) : moment()
            });
        }
    }, [initialValues, form]);

    useEffect(() => {
        if (!uomSetup || uomSetup.length === 0) {
            dispatch(fetchUoMSetup());
        }
    }, [dispatch, uomSetup]);

    const handleItemSelect = (value: string) => {
        const item = itemsList?.find((itm) => itm.itemNo === value);
        setSelectedItem(item);

        if (item) {
            form.setFieldsValue({
                
                item: item.itemNo,
                uom: item.unitofMeasure,
                unitPrice: formatCurrencyUSD(item?.unitPrice),
                quantity: 0,
                amount: 0
            });
        }
    };
const handleSubmit = async (values: any) => {
    if (!selectedItem) return; 

    const payload = {
        DocumentNo: documentNo || '',
        ProcurementItem: selectedItem.itemNo,
        Quantity: Number(values.quantity),
        UnitOfMeasure: values.uom,
        UnitPrice: Number(values.unitPrice),
        Specification: values.specification,
        LineNo: initialValues?.lineNo || 0,
        DateRequired: values.requiredDate?.toISOString(),
    };

    try {
        const res = await dispatch(createPurchaseLine(payload)).unwrap();

        if (documentNo) {
            await dispatch(fetchPurchaseRequestLines({ documentNo }));
        }

        api.success({
            message: 'Success',
            description: res?.message || 'Request line added successfully',
            duration: 3,
        });

        form.resetFields(['quantity', 'unitPrice', 'specification', 'uom']);
        setSelectedItem(null);

    } catch (err: any) {
        const errorMessage = err?.message || 'Failed to submit request line';
        console.error('Submission error:', errorMessage);

        api.error({
            message: 'Submission Failed',
            description: errorMessage,
            duration: 5,
        });
    }
};


    return (
        <Modal
            open={visible}
            onCancel={onClose}
            title="Add Purchase Request Line"
            footer={null}
            destroyOnClose
            style={{ top: 20 }}
            width={800}
        >
            {contextHolder}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={{ requiredDate: moment() }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Select Item"
                            name="item"
                            rules={[{ required: true, message: 'Please select an item' }]}
                        >
                            <Select placeholder="Select an item" onSelect={handleItemSelect}>
                                {itemsList?.map((item) => (
                                    <Option key={item.itemNo} value={item.itemNo}>
                                        {item.itemDescription}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Required Date" name="requiredDate">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                   
                    <Col span={12}>
                        <Form.Item
                            label="Quantity"
                            name="quantity"
                            rules={[{ required: true, message: 'Please enter quantity' }]}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Unit of Measure"
                            name="uom"
                            rules={[{ required: true, message: 'Please select UOM' }]}
                        >
                            <Select placeholder="Select UOM" allowClear>
                                {uomSetup?.map((uom) => (
                                    <Option key={uom.code} value={uom.code}>
                                        {uom.description}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Estimated Unit Price"
                            name="unitPrice"
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                   <Col span={12}>
                                          <Form.Item
                                              label="Select Issuing Store"
                                              name="location"
                                              rules={[{ required: true, message: 'Please select a store item' }]}
                                          >
                                              <Select placeholder="Select issuing store">
                                                  {issuingStoreSetup?.map((item) => (
                                                      <Option key={item.code} value={item.code}>
                                                          {item.description}
                                                      </Option>
                                                  ))}
                                              </Select>
                                          </Form.Item>
                                      </Col>
                
                </Row>

                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={status === 'pending'}>
                        Submit Request Line
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default RequestLineModal;
