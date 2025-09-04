import React, { useEffect, useMemo } from 'react';
import {
  Form,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Typography,
  InputNumber,
  Skeleton,
  notification,
} from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { fetchImprestLine, selectSubmitImprestLine, submitImprestLine, type ImprestData, type ImprestLinesData, type ImprestLinesPayload } from '../../../../features/finance/advanceRequisition';

import type { DropdownOptions } from '../../../../types/dropdown';

const { Option } = Select;

interface RequestLineModalProps {
  visible: boolean;
  onClose: () => void;
  listofExpenditureTypes: DropdownOptions[];
  initialLine?: ImprestLinesData;
  documentDetails?: ImprestData | null;
}



const AdvanceRequestLineModal: React.FC<RequestLineModalProps> = ({
  visible,
  onClose,
  listofExpenditureTypes,
  initialLine,
  documentDetails,
}) => {
  const dispatch = useAppDispatch();
  const docNo = new URLSearchParams(window.location.search).get('DocumentNo');
  const error = useAppSelector((state) => state.commonSetup.error);
  const { status: lineSubmitStatus, error: lineSubmitError } = useAppSelector(selectSubmitImprestLine);
  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  // Initialize or reset form values
  useEffect(() => {
    if (initialLine) {
      form.setFieldsValue({
        amount: initialLine.lineAmount,
        expenditureType: initialLine.expenditureType,
      });
    } else {
      form.resetFields();
    }
  }, [initialLine, form]);




  // Handle form submission
  const handleSubmit = async (values: ImprestLinesPayload) => {
    const payload = { ...values, documentNo: docNo, lineNo:initialLine?.lineNo ?? 0 };

    try {
      const res = await dispatch(submitImprestLine(payload));

      if (submitImprestLine.fulfilled.match(res)) {
        api.success({
          message: 'Success',
          description: res.payload?.description || 'Request Line added successfully',
          duration: 3,
          onClose() {
            if (docNo) {
              dispatch(fetchImprestLine({ documentNo: docNo }));
            }
            onClose();
          },
        });
      }
      else if (submitImprestLine.rejected.match(res)) {
        api.error({
          message: 'Submission Failed',
          description: res.payload?.message || 'Unable to submit request line',
          duration: 5,
        });
      }
    } catch (err: any) {
      api.error({
        message: 'Unexpected Error',
        description: err?.message || 'Something went wrong while submitting the request line.',
        duration: 5,
      });
    }finally{
      form.resetFields();
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={visible}
        onCancel={onClose}
        title={`${initialLine ? 'Edit' : 'Add'} Request Line`}
        footer={null}
        destroyOnClose
        width={800}
        style={{ top: 20 }}
      >
        {lineSubmitStatus === 'pending' ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <>
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" initialValues={{ requiredDate: moment() }}>
              <Row gutter={16}>


                <Col span={12}>
                  <Form.Item label="Expenditure Type" name="expenditureType" rules={[{ required: true }]}>
                    <Select showSearch placeholder="Select Expenditure Type" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())}>
                      <Option value="">-- All Expenditure Types --</Option>
                      {listofExpenditureTypes?.map(type => <Option key={type.code} value={type.code}>{type.description}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Input Amount" name="amount">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>       

              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
                <Button type="primary" htmlType="submit">Submit Request Line</Button>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default AdvanceRequestLineModal;
