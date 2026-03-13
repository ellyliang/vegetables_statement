<template>
  <div id="app">
    <div class="page-header">
      <h2>商户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="dialogVisible = true">
          <i class="el-icon-plus"></i> 添加商户
        </el-button>
        <el-button type="primary" @click="exportStalls">
          <i class="el-icon-download"></i> 导出商户
        </el-button>
        <el-button @click="refreshData">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>商户列表</h3>
        <div class="card-header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商户名称或联系人"
            style="width: 200px; margin-right: 10px;"
            clearable
          ></el-input>
          <el-button @click="search">搜索</el-button>
        </div>
      </div>
      <el-table :data="filteredStalls" style="width: 100%;" stripe>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="remark" label="备注" width="150"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editStall(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="removeStall(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" v-if="filteredStalls.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredStalls.length"
        ></el-pagination>
      </div>
    </div>

    <!-- 添加商户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加商户"
      width="600px"
    >
      <el-form :model="newStall" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户名称" required>
              <el-input v-model="newStall.name" placeholder="请输入商户名称" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" required>
              <el-input v-model="newStall.contact" placeholder="请输入联系人" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" required>
              <el-input v-model="newStall.phone" placeholder="请输入联系电话" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" required>
              <el-input v-model="newStall.address" placeholder="请输入地址" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="newStall.remark" placeholder="请输入备注" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addStall">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商户"
      width="600px"
    >
      <el-form :model="editStall" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户名称" required>
              <el-input v-model="editStall.name" placeholder="请输入商户名称" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" required>
              <el-input v-model="editStall.contact" placeholder="请输入联系人" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" required>
              <el-input v-model="editStall.phone" placeholder="请输入联系电话" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" required>
              <el-input v-model="editStall.address" placeholder="请输入地址" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="editStall.remark" placeholder="请输入备注" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateStall">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档', contact: '张三', phone: '13800138001', address: '北京市朝阳区建国路88号', remark: '长期合作' },
        { id: 2, name: '李四大排档', contact: '李四', phone: '13900139002', address: '北京市朝阳区建国路99号', remark: '新客户' },
        { id: 3, name: '王五大排档', contact: '王五', phone: '13700137003', address: '北京市西城区西单大街120号', remark: 'VIP客户' }
      ],
      newStall: {
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      },
      editStall: {
        id: '',
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      },
      addDialogVisible: false,
      editDialogVisible: false,
      searchKeyword: '',
      currentPage: 1,
      pageSize: 20
    };
  },
  computed: {
    filteredStalls() {
      if (!this.searchKeyword) {
        return this.stalls;
      }
      const keyword = this.searchKeyword.toLowerCase();
      return this.stalls.filter(stall => 
        stall.name.toLowerCase().includes(keyword) || 
        stall.contact.toLowerCase().includes(keyword)
      );
    }
  },
  methods: {
    addStall() {
      if (this.newStall.name) {
        const newId = this.stalls.length > 0 ? Math.max(...this.stalls.map(stall => stall.id)) + 1 : 1;
        this.stalls.push({
          id: newId,
          ...this.newStall
        });
        this.resetForm();
        this.addDialogVisible = false;
        this.$message.success('商户添加成功');
      } else {
        this.$message.error('请填写商户名称');
      }
    },
    removeStall(row) {
      this.$confirm('确定要删除此商户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.stalls.findIndex(stall => stall.id === row.id);
        if (index !== -1) {
          this.stalls.splice(index, 1);
          this.$message.success('商户删除成功');
        }
      }).catch(() => {
        // 取消删除
      });
    },
    editStall(row) {
      this.editStall = { ...row };
      this.editDialogVisible = true;
    },
    updateStall() {
      if (this.editStall.name) {
        const index = this.stalls.findIndex(stall => stall.id === this.editStall.id);
        if (index !== -1) {
          this.stalls[index] = { ...this.editStall };
          this.editDialogVisible = false;
          this.$message.success('商户更新成功');
        }
      } else {
        this.$message.error('请填写商户名称');
      }
    },
    resetForm() {
      this.newStall = {
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      };
    },
    exportStalls() {
      // 导出商户列表逻辑
      this.$message.success('商户列表导出成功');
    },
    refreshData() {
      // 刷新数据逻辑
      this.$message.success('数据刷新成功');
    },
    search() {
      // 搜索逻辑
      this.currentPage = 1;
    },
    handleSizeChange(val) {
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    }
  }
};
</script>

<style scoped>
#app {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-stall-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-table {
  margin-bottom: 20px;
}

.el-table th {
  font-weight: 600;
  background-color: #fafafa;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .card-header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 12px;
  }
  
  .page-header h2 {
    font-size: 18px;
  }
  
  .card-header h3 {
    font-size: 14px;
  }
  
  .el-form-item label {
    font-size: 13px;
  }
}
</style>