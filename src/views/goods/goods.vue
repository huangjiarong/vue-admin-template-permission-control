<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 10px;"
      @sort-change="sortChange"
    >
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名" width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品封面图" width="160px" align="center">
        <template slot-scope="scope">
          <el-image
            class="table-td-thumb"
            :src="scope.row.cover_img"
            :preview-src-list="[scope.row.cover_img]"
          />
          <el-image
            class="table-td-thumb"
            :src="scope.row.cover_img"
            :preview-src-list="[scope.row.cover_img]"
          />
          <el-image
            class="table-td-thumb"
            :src="scope.row.cover_img"
            :preview-src-list="[scope.row.cover_img]"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="checkPermission(['admin', 'can_delete'])" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;" enctype="multipart/form-data">
        <el-form-item label="分类" prop="category">
          <el-select v-model="temp.category" class="filter-item" placeholder="请选择分类">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" ref="cover" label="封面图" prop="cover_img">
          <el-upload
            ref="upload"
            class="upload-demo"
            action=""
            accept="image/png, image/jpeg"
            :before-upload="beforeUploadDetail"
            :before-remove="beforeRemove"
            :on-change="onChange"
            :limit="1"
            :auto-upload="false"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5M</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-else ref="cover" label="封面图" prop="cover_img">
          <el-upload
            ref="upload"
            class="upload-demo"
            action=""
            accept="image/png, image/jpeg"
            :before-upload="beforeUploadDetail"
            :before-remove="beforeRemove"
            :on-change="onChange"
            :limit="1"
            :auto-upload="false"
            :file-list="temp.cover_img"
            list-type="picture"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5M</div>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item ref="detail_img" label="详情图" prop="detail_img">
          <el-upload
            ref="upload_detail"
            class="upload-demo"
            action=""
            name="detail_img"
            accept="image/png, image/jpeg"
            :before-upload="beforeUploadDetail"
            :auto-upload="false"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5M</div>
          </el-upload>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
        <el-button @click="dialogFormVisible=false">
          取消
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
// import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { getAllGoods, getAllCategory, updateArticle, createGoods, deleteGoods } from '@/api/goods'
import waves from '@/directive/waves' // waves directive
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        sort: '+id'
      },
      // 该字段用来决定是否进行请求createData的api
      toUpload: true,
      uploadForm: new FormData(),
      categoryOptions: [],
      fileList: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        name: '',
        category: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商品',
        create: '添加新商品'
      },
      dialogPvVisible: false,
      // 表单验证
      rules: {
        category: [{ required: true, message: '分类是必须选择的!', trigger: 'change' }],
        name: [{ required: true, message: '商品名是必须填写的!', trigger: 'blur' }],
        cover_img: [{ required: true, message: '封面图必须选择!', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取table数据
    getList() {
      this.listLoading = true
      getAllGoods(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 获取弹出框分类选择的数据
    getCategoryOptions() {
      getAllCategory().then(response => {
        this.categoryOptions = response.results
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    // 打开弹出框时重置表单数据
    resetTemp() {
      this.temp = {
        name: '',
        category: ''
      }
    },
    // 添加功能, 弹出添加框
    handleCreate() {
      // 获取可供选择的商品类别
      this.getCategoryOptions()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        // 清空图片选择
        this.$refs.upload.clearFiles()
      })
    },
    // 保存新增的数据
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$refs.upload.submit()
          if (!this.toUpload) {
            return false
          }
          this.uploadForm.append('category', this.temp.category)
          this.uploadForm.append('name', this.temp.name)
          createGoods(this.uploadForm).then(response => {
            this.list.unshift(response)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      const cover_img = this.temp.cover_img
      this.temp.cover_img = [{ 'name': '图片1', 'url': cover_img }]
      this.getCategoryOptions()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.list.splice(index, 1)
        const name = row.name
        deleteGoods(row.id).then(res => {
          this.$message({
            type: 'success',
            message: '删除 ' + name + ' 成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    beforeUploadDetail(file) {
      // 判断文件后缀是否为jpg和png, 不是则提示, 且不请求提交表单
      const FileExt = file.name.replace(/.+\./, '')
      if (['jpg', 'png'].indexOf(FileExt.toLowerCase()) === -1) {
        this.$message({
          type: 'error',
          message: '请上传后缀名为jpg、png的附件！'
        })
        this.toUpload = false
        return false
      }
      // 限制文件上传大小, 大于5M则提示, 且不请求提交表单
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message({
          message: '上传文件大小不能超过5M!',
          type: 'error'
        })
        this.toUpload = false
        return false
      }
      this.uploadForm.append('cover_img', file)
      this.toUpload = true
      return false
    },
    beforeRemove(file, fileList) {
      // 当没有选择图片时, 修改验证规则为必须
      console.log('before move' + fileList.length)
      if (fileList.length === 1) {
        this.rules.cover_img = [{ required: true, message: '封面图必须选择!', trigger: 'blur' }]
      // this.temp.cover_img = ''
      }
    },
    onChange(file, fileList) {
      // 上传控件有选择时, 修改验证规则为空
      this.rules.cover_img = []
      this.$refs['cover'].clearValidate()
    },
    checkPermission
  }
}
</script>

<style>
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
    float: left;
    margin-right: 5px;
}
</style>
