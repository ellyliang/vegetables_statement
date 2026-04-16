<script setup lang="ts">
import { ref, onMounted } from 'vue';
import orderApi from '@/api/orderApi';
import merchantApi from '@/api/merchantApi';
import type { Merchant, Order } from '@/types';

// 商户数据
const merchants = ref<Merchant[]>([]);

// 订单数据
const orders = ref<Order[]>([]);

// 编辑状态
const isEditing = ref<boolean>(false);
const currentOrder = ref<Partial<Order> & { id: number | string }>({ id: '', vegetable: '', weight: '', price: '', stallId: '', completed: false });

// 蔬菜分类数据
const vegetableCategories = ref<Record<string, string[]>>({
  '葱姜蒜类': ['韭菜', '蒜苗', '大蒜', '生姜', '大葱', '小葱', '蒜苔', '洋葱', '葱头', '洋姜', '葱仔', '韭菜', '野蒜', '阳荷', '红珠姜', '沙姜', '山姜', '南姜', '凤姜', '沙葱', '茗葱', '葱', '紫（黑）姜', '蒜黄', '葱黄', '韭苔', '葱头', '洋葱苔'],
  '根茎菜类': ['鲜百合', '芦笋', '萝卜', '胡萝卜', '竹笋', '葛根', '魔芋', '木薯', '凉薯', '山药', '红薯', '紫薯', '土豆', '芋头', '板薯', '雪莲果', '盘菜', '广芋', '土耳苕', '糯米薯', '姜薯', '竹芋', '毛薯', '甜菜头', '山药豆', '芥菜头', '根芹'],
  '叶菜类': ['白菜', '小白菜', '生菜', '苋莱', '娃娃菜', '木耳菜', '香菜', '油麦菜', '空心菜', '菠菜', '萝卜菜', '芹菜', '莴笋', '荠菜', '芥莱', '菜苔', '儿菜', '茼蒿', '豆腐菜', '蕹菜', '丝瓜尖', '塌菜', '番杏', '玉兰菜', '水晶菜', '麻叶菜', '紫菜薹', '银丝菜', '菊苣', '羽衣甘蓝', '春菜', '牛皮菜'],
  '豆菜类': ['毛豆', '刀豆', '四季豆', '豆角', '扁豆', '豌豆', '荷兰豆', '四棱豆', '白豆玉', '狗爪豆', '新鲜蚕豆', '油豆角', '荷包豆'],
  '茄果菜类': ['辣椒', '西红柿', '茄子', '秋葵', '鲜玉米', '玉米笋', '树番茄'],
  '食用菌': ['松树菌', '元蘑', '珊瑚菌', '鹿茸菇', '栗蘑', '龙爪菇', '荷灵菇', '海鲜菇', '毛尖蘑', '姬菇', '褐蘑', '鸡腿菇', '竹菌', '紫花菌', '白灵菇', '灵芝菇', '大球盖菇', '黄蘑', '松露', '松茸', '银盘蘑菇', '松乳菇', '猪肚菇', '滑子菇', '榛蘑', '青杠菌', '鸡油菌', '鹅蛋菌', '青头菌', '干巴菌', '虎奶菇', '红菇', '鸡枞菌', '羊肚菌', '双孢菇', '荔枝菌', '见手青', '白菌', '草菇', '奶浆菌', '香菇', '木耳', '金针菇', '平菇', '松茸', '银耳', '猴头菇', '牛肝菌', '杏鲍菇', '茶树菇', '竹荪', '蘑菇', '密环菌', '花脸蘑', '蟹味菇', '树秋菌', '剥皮菇', '柳花菜', '羊肚耳', '绣球菌', '香菇脚', '白玉菇', '鲍鱼菇', '姬松茸', '乌菌', '虾米菇', '马勃菇', '石耳', '榆耳', '银掌菇', '白参菌', '马鞍菌', '硫磺菌', '牛舌菌', '凤尾菇', '扇贝菇', '忠壮赤菇', '虎掌菌', '桦剥管菌', '隐孔菌', '北虫草', '白蚁谷堆伞', '扫把菇', '菇', '铆钉菇', '紫丁香蘑', '老人头菌', '香乳菇', '粉香菇', '喇叭菌', '荷叶蘑', '猪脑菌', '秀珍菇', '滑头菌', '松疣赤', '松茸菌', '桑椹菌', '雪莲菇'],
  '瓜菜类': ['南瓜', '丝瓜', '冬瓜', '黄瓜', '苦瓜', '佛手瓜', '西葫芦', '金丝绞瓜', '瓠瓜', '地蒲', '葫芦', '杜瓜', '菜瓜', '蛇瓜', '红瓜', '梢瓜', '套菜'],
  '芽苗类': ['豌豆苗', '香椿芽', '豆芽', '刺老芽', '芽芽', '龙柏芽', '沙松尖', '木兰芽', '苜蓿芽', '花生芽', '萝卜芽', '花椒芽', '油葵芽', '松柳芽', '枸杞芽', '佛手瓜藤尖', '荞麦芽', '柳蒿芽', '桑芽', '小麦芽', '甜菜苗', '芹芽', '嫩豆苗'],
  '野菜特菜': ['红薯叶', '刺芹', '金花菜', '马兰头', '紫背天葵', '蕨菜', '新鲜紫苏', '地莲花', '冰草', '苦菊', '山野菊', '南瓜藤', '发菜', '莼菜', '鱼腥草', '香草草', '地皮菜', '马齿苋', '宝塔菜', '象牙菜', '救心菜', '贡菜', '山苏菜', '珊瑚菜', '迷迭香', '刁草', '棕包', '云参', '辣根', '野莲', '苦楝果', '刺五加菜', '洋蓟', '银条菜', '苦菜', '山露菜', '山菏菜', '辣木菜', '雪樱子', '郎菜', '碱蓬草', '棉线火镰菜', '菊菜', '人参菜', '冬寒菜', '芋梗', '梦草', '清明菜', '蒲公英菜', '罗勒', '伤力草', '青蒿', '苦子', '牛尾菜', '臭菜', '新鲜板蓝根', '龙蒿', '芝麻叶', '芝麻菜', '珍珠花菜', '蓝麻子菜', '长考菜', '野觅菜', '野芹菜', '血通菜', '小蓟草', '象耳朵叶', '薇菜', '树仔菜', '树花菜', '山油菜', '山山楂', '山胡萝卜', '山根菜', '扫帚菜', '曲曲菜', '面条菜', '猫爪子', '马蹄叶', '芦苇芽', '苦斋菜', '叶苦菜', '紫藤花', '苦芽芽', '灰灰菜', '黄芽杆', '黄须菜', '猴腿菜', '姑娘菜', '富贵菜', '东风菜', '大叶芹', '白蒿菜', '芭蒿', '茴香头', '水香菜', '茴香', '柠檬叶', '构树穗', '田七菜', '马泡瓜', '桃叶鸡葱', '猪毛菜', '白凤菜'],
  '水生菜类': ['茭白', '莲藕', '菱角', '慈菇', '藕带', '鲜芡实', '莲蓬', '荇菜', '浒苔', '蒲菜', '芡实杆', '鹿角菜'],
  '甘蓝类': ['苤蓝', '花菜', '西兰花', '包菜', '芥蓝', '西兰苔'],
  '菜用花类': ['黄花菜', '夜兰花', '夜香花', '槐树花', '黄瓜花', '南瓜花', '苦刺花', '核桃花', '菜用金雀花', '棠梨花', '韭菜花', '野葱花', '芭蕉花', '火龙果花', '木姜花']
});

// 选中的分类
const selectedCategory = ref<string>('');

// 加载商户数据
const loadMerchants = async (): Promise<void> => {
  try {
    const response = await merchantApi.getAllMerchants();
    if (response.success) {
      merchants.value = response.data;
    }
  } catch (error) {
    console.error('加载商户数据失败:', error);
  }
};

// 加载订单数据
const loadOrders = async (): Promise<void> => {
  try {
    const response = await orderApi.getAllOrders();
    if (response.success) {
      orders.value = response.data;
    }
  } catch (error) {
    console.error('加载订单数据失败:', error);
  }
};

// 打开编辑对话框
const openEditDialog = (order: Order): void => {
  currentOrder.value = { ...order };
  isEditing.value = true;
};

// 关闭编辑对话框
const closeEditDialog = (): void => {
  isEditing.value = false;
  currentOrder.value = { id: '', vegetable: '', weight: '', price: '', stallId: merchants.value[0]?.id || '', completed: false };
};

// 保存订单信息
const saveOrder = async (): Promise<void> => {
  try {
    if (currentOrder.value.id) {
      // 编辑现有订单
      const response = await orderApi.updateOrder(currentOrder.value.id, currentOrder.value);
      if (response.success) {
        await loadOrders();
      }
    } else {
      // 添加新订单
      const response = await orderApi.createOrder(currentOrder.value);
      if (response.success) {
        await loadOrders();
      }
    }
    closeEditDialog();
  } catch (error) {
    console.error('保存订单信息失败:', error);
  }
};

// 删除订单
const deleteOrder = async (id: number | string): Promise<void> => {
  try {
    const response = await orderApi.deleteOrder(id);
    if (response.success) {
      await loadOrders();
    }
  } catch (error) {
    console.error('删除订单失败:', error);
  }
};

// 切换订单完成状态
const toggleCompleted = async (id: number | string): Promise<void> => {
  try {
    const response = await orderApi.toggleCompleted(id);
    if (response.success) {
      await loadOrders();
    }
  } catch (error) {
    console.error('更新订单状态失败:', error);
  }
};

// 打开添加对话框
const openAddDialog = (): void => {
  currentOrder.value = { id: '', vegetable: '', weight: '', price: '', stallId: merchants.value[0]?.id || '', completed: false };
  isEditing.value = true;
};

// 选择蔬菜
const selectVegetable = (vegetable: string): void => {
  currentOrder.value.vegetable = vegetable;
};

// 生命周期钩子
onMounted(async () => {
  await loadMerchants();
  await loadOrders();
});
</script>

<template>
  <div class="vegetable-order-container">
    <h3>蔬菜订单</h3>
    <div style="margin-bottom: 16px;">
      <button
        class="btn btn-primary"
        @click="openAddDialog"
      >
        添加订单
      </button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>蔬菜名称</th>
          <th>重量（斤）</th>
          <th>价格（元）</th>
          <th>大排档</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders"
          :key="order.id"
        >
          <td>{{ order.id }}</td>
          <td>{{ order.vegetable }}</td>
          <td>{{ order.weight }}</td>
          <td>{{ order.price }}</td>
          <td>{{ merchants.find(m => m.id === order.stallId)?.name }}</td>
          <td>
            <input
              v-model="order.completed"
              type="checkbox"
              @change="toggleCompleted(order.id)"
            >
            {{ order.completed ? '已完成' : '未完成' }}
          </td>
          <td>
            <button
              class="btn btn-primary"
              @click="openEditDialog(order)"
            >
              编辑
            </button>
            <button
              class="btn btn-default"
              @click="deleteOrder(order.id)"
            >
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 编辑对话框 -->
    <div
      v-if="isEditing"
      class="dialog-overlay"
    >
      <div class="dialog-content">
        <h4>{{ currentOrder.id ? '编辑订单' : '添加订单' }}</h4>
        <div class="form-item">
          <label class="form-label">蔬菜分类：</label>
          <select
            v-model="selectedCategory"
            class="form-control"
          >
            <option value="">
              请选择分类
            </option>
            <option
              v-for="(vegetables, category) in vegetableCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div
          v-if="selectedCategory"
          class="vegetable-list"
        >
          <span 
            v-for="vegetable in vegetableCategories[selectedCategory]" 
            :key="vegetable"
            class="vegetable-tag"
            @click="selectVegetable(vegetable)"
          >
            {{ vegetable }}
          </span>
        </div>
        <div class="form-item">
          <label class="form-label">蔬菜名称：</label>
          <input
            v-model="currentOrder.vegetable"
            type="text"
            class="form-control"
            placeholder="请输入蔬菜名称"
          >
        </div>
        <div class="form-item">
          <label class="form-label">重量（斤）：</label>
          <input
            v-model.number="currentOrder.weight"
            type="number"
            class="form-control"
          >
        </div>
        <div class="form-item">
          <label class="form-label">价格（元）：</label>
          <input
            v-model.number="currentOrder.price"
            type="number"
            class="form-control"
          >
        </div>
        <div class="form-item">
          <label class="form-label">大排档：</label>
          <select
            v-model="currentOrder.stallId"
            class="form-control"
          >
            <option
              v-for="merchant in merchants"
              :key="merchant.id"
              :value="merchant.id"
            >
              {{ merchant.name }}
            </option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">状态：</label>
          <input
            v-model="currentOrder.completed"
            type="checkbox"
          >
          {{ currentOrder.completed ? '已完成' : '未完成' }}
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-default"
            @click="closeEditDialog"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click="saveOrder"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vegetable-order-container {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-content h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: inline-block;
  width: 100px;
  font-weight: 500;
  margin-right: 12px;
  text-align: right;
  vertical-align: top;
  line-height: 32px;
}

.form-control {
  width: 280px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.vegetable-list {
  margin-top: 12px;
  margin-bottom: 24px;
  margin-left: 112px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}

.vegetable-tag {
  padding: 4px 12px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.vegetable-tag:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.dialog-actions {
  margin-top: 24px;
  text-align: right;
}

.btn {
  display: inline-block;
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-right: 8px;
  margin-bottom: 8px;
}

.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-default {
  background-color: #fff;
  color: #333;
}

.btn-default:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
}

.table tr:hover {
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-label {
    display: block;
    width: 100%;
    text-align: left;
    margin-bottom: 8px;
  }
  
  .form-control {
    width: 100%;
  }
  
  .vegetable-list {
    margin-left: 0;
  }
  
  .table {
    font-size: 12px;
  }
  
  .table th,
  .table td {
    padding: 8px;
  }
}
</style>
