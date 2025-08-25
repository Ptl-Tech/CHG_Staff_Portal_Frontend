import React, { useEffect } from 'react';
import {
  Form,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Typography,
  InputNumber,
  Input,
  DatePicker,
  Skeleton,
  notification,
} from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
  selectSubmitSurrenderLine,
  submitSurrenderLine,
} from '../../../../features/finance/advanceSurrender';
import { fetchSurrenderLines } from '../../../../features/finance/commonRequest';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import type { ImprestSurrenderLineData } from '../../../../types/PaymentData';

const SurrenderAmountModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  initialLine?: ImprestSurrenderLineData;
}> = ({ visible, onClose, initialLine }) => {
  const dispatch = useAppDispatch();
  const docNo = new URLSearchParams(window.location.search).get('DocumentNo') || '';
  const [api, contextHolder] = notification.useNotification();
  const { status: lineSubmitStatus, error: lineSubmitError } =
    useAppSelector(selectSubmitSurrenderLine);

  const [form] = Form.useForm();

  useEffect(() => {
    if (initialLine) {
      form.setFieldsValue({
        actualSpent: initialLine.actualSpent,
        additionalComments: initialLine.additionalComments,
        lineAmount: initialLine.lineAmount,
      });
    } else {
      form.resetFields();
    }
  }, [initialLine, form]);

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      documentNo: docNo,
      lineNo: initialLine?.lineNo ?? 0,
    };
    dispatch<any>(submitSurrenderLine(payload)).then((res: any) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        api.success({
          message: 'Success',
          description: res.payload?.description || 'Surrender line submitted successfully.',
          duration: 3,
        });
        dispatch(fetchSurrenderLines({ documentNo: docNo }));
        onClose();
      } else {
        api.error({
          message: 'Error',
          description:
            lineSubmitError ||
            'Failed to submit surrender line.',
          duration: 4,
        });
      }
    });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={`${initialLine ? 'Edit' : 'Add'} Surrender Amount`}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
      width={600}
    >
      {contextHolder}
      {lineSubmitStatus === 'pending' ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            requiredDate: moment(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Total Amount" name="lineAmount">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) =>
                    val == null ? '' : formatCurrencyUSD(Number(val))
                  }
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Actual Spent"
                name="actualSpent"
                rules={[{ required: true, message: 'Please enter actual spent' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Additional Comments" name="additionalComments">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Surrender Line
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default SurrenderAmountModal;
